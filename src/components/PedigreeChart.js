import React, { useEffect, useRef } from "react";
import * as go from "gojs";

export default function PedigreeChart({ formInfo }) {
  const diagramRef = useRef(null);

  useEffect(() => {
    // Initialize the diagram only once
    if (diagramRef.current && !diagramRef.current.diagram) {
      const $ = go.GraphObject.make;
      const diagram = $(go.Diagram, diagramRef.current, {
        layout: $(go.TreeLayout, {
          arrangement: go.TreeLayout.ArrangementHorizontal,
          angle: 90,
          layerSpacing: 30,
          nodeSpacing: 10,
        }),
      });

      // Node Template
      diagram.nodeTemplate = $(go.Node, "Auto", 
        $(go.Shape, {
          fill: "white",
          strokeWidth: 1,
          desiredSize: new go.Size(60, 60),
        }, 
        new go.Binding("figure", "gender", (gender) => gender === "male" ? "Square" : "Circle"),
        new go.Binding("fill", "gender", (gender) => gender === "male" ? "lightblue" : "lightpink")
        ),
        $(go.TextBlock, {
          margin: 5,
          textAlign: "center",
          verticalAlignment: go.Spot.Center,
          font: "bold 10px sans-serif",
          wrap: go.TextBlock.WrapFit,
          maxSize: new go.Size(50, NaN),
        }, new go.Binding("text", "key"))
      );

      // Link Template
      diagram.linkTemplate = $(go.Link, { routing: go.Link.Orthogonal, corner: 5 }, $(go.Shape));

      // Relationship Link Template
      diagram.linkTemplateMap.add(
        "Relationship",
        $(go.Link, {
          routing: go.Link.Normal,
          selectable: false,
          isTreeLink: false,
          isLayoutPositioned: false,
          layerName: "Background",
        }, $(go.Shape, { stroke: "black", strokeWidth: 2 }))
      );

      // Store the diagram instance in the ref
      diagramRef.current.diagram = diagram;
    }

    // Update the model whenever formInfo changes
    if (diagramRef.current.diagram) {
      const diagram = diagramRef.current.diagram;

      // Define nodes dynamically based on formInfo
      const nodeDataArray = [
        { key: "Maternal Grandfather", gender: "male" },
        { key: "Maternal Grandmother", gender: "female" },
        { key: "Paternal Grandfather", gender: "male" },
        { key: "Paternal Grandmother", gender: "female" },
        // Add Paternal Uncles and Aunts
        ...Array.from({ length: formInfo.paternalUncles }, (_, i) => ({
          key: `Paternal Uncle ${i + 1}`,
          parent: "Paternal Grandfather",
          gender: "male",
        })),
        ...Array.from({ length: formInfo.paternalAunts }, (_, i) => ({
          key: `Paternal Aunt ${i + 1}`,
          parent: "Paternal Grandfather",
          gender: "female",
        })),
        { key: "Father", parent: "Paternal Grandfather", gender: "male" },
        ...Array.from({ length: formInfo.maternalUncles }, (_, i) => ({
          key: `Maternal Uncle ${i + 1}`,
          parent: "Maternal Grandfather",
          gender: "male",
        })),
        ...Array.from({ length: formInfo.maternalAunts }, (_, i) => ({
          key: `Maternal Aunt ${i + 1}`,
          parent: "Maternal Grandfather",
          gender: "female",
        })),
        { key: "Mother", parent: "Maternal Grandfather", gender: "female" },
        ...Array.from({ length: formInfo.brothers }, (_, i) => ({
          key: `Brother ${i + 1}`,
          parent: "Mother",
          gender: "male",
        })),
        ...Array.from({ length: formInfo.sisters }, (_, i) => ({
          key: `Sister ${i + 1}`,
          parent: "Mother",
          gender: "female",
        })),
        { key: formInfo.name, parent: "Mother", gender: formInfo.gender },
        ...Array.from({ length: formInfo.sons }, (_, i) => ({
          key: `Son ${i + 1}`,
          parent: formInfo.name,
          gender: "male",
        })),
        ...Array.from({ length: formInfo.daughters }, (_, i) => ({
          key: `Daughter ${i + 1}`,
          parent: formInfo.name,
          gender: "female",
        })),
      ];

      // Link Data (parent-child relationships and custom relationships)
      const linkDataArray = [
        { from: "Maternal Grandfather", to: "Maternal Grandmother", category: "Relationship" },
        { from: "Paternal Grandfather", to: "Paternal Grandmother", category: "Relationship" },
        { from: "Paternal Grandfather", to: "Father" },
        { from: "Maternal Grandfather", to: "Mother" },
        // Add link from Maternal Grandmother to her children (Mother, Maternal Aunt, Maternal Uncle)
        { from: "Maternal Grandmother", to: "Mother", category: "Relationship" },
        ...Array.from({ length: formInfo.maternalUncles }, (_, i) => ({
          from: "Maternal Grandmother",
          to: `Maternal Uncle ${i + 1}`,
          category: "Relationship",
        })),
        ...Array.from({ length: formInfo.maternalAunts }, (_, i) => ({
          from: "Maternal Grandmother",
          to: `Maternal Aunt ${i + 1}`,
          category: "Relationship",
        })),
        // Add relationship between Mother and Father
        { from: "Mother", to: "Father", category: "Relationship" },
        ...nodeDataArray
          .filter((node) => node.parent && 
            // Exclude duplicate links for Maternal Grandfather and Mother
            (node.parent !== "Maternal Grandfather" || node.key !== "Mother") &&
            // Exclude duplicate links for Paternal Grandfather and Father
            (node.parent !== "Paternal Grandfather" || node.key !== "Father")
          )
          .map((node) => ({ from: node.parent, to: node.key })),
      ];

      // Set the model
      diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

      // Position the grandparents explicitly after layout
      diagram.addDiagramListener("InitialLayoutCompleted", () => {
        const maternalGrandfather = diagram.findNodeForKey("Maternal Grandfather");
        const maternalGrandmother = diagram.findNodeForKey("Maternal Grandmother");
        const paternalGrandfather = diagram.findNodeForKey("Paternal Grandfather");
        const paternalGrandmother = diagram.findNodeForKey("Paternal Grandmother");
        
        // Positioning grandparents
        if (maternalGrandfather && maternalGrandmother) {
          maternalGrandfather.position = new go.Point(0, 0);
          maternalGrandmother.position = new go.Point(100, 0);
        }

        if (paternalGrandfather && paternalGrandmother) {
          paternalGrandfather.position = new go.Point(400, 0);
          paternalGrandmother.position = new go.Point(500, 0);
        }

        // Swap positions of Mother and Maternal Aunt 1
        const motherNode = diagram.findNodeForKey("Mother");
        const maternalAunt1Node = diagram.findNodeForKey("Maternal Aunt 1");
        if (motherNode && maternalAunt1Node) {
          // Get the current positions of Mother and Maternal Aunt 1
          const motherPos = motherNode.location;
          const maternalAunt1Pos = maternalAunt1Node.location;

          // Swap the positions
          motherNode.position = maternalAunt1Pos;
          maternalAunt1Node.position = motherPos;
        }

        // Adjust positions of the paternal uncles and aunts
        const paternalFather = diagram.findNodeForKey("Father");
        if (paternalFather) {
          let xPosition = paternalFather.location.x + 100; // Adjust accordingly
          for (let i = 1; i <= formInfo.paternalUncles; i++) {
            const paternalUncle = diagram.findNodeForKey(`Paternal Uncle ${i}`);
            if (paternalUncle) {
              paternalUncle.position = new go.Point(xPosition, paternalFather.location.y);
              xPosition += 100; // Adjust for next uncle
            }
          }
          for (let i = 1; i <= formInfo.paternalAunts; i++) {
            const paternalAunt = diagram.findNodeForKey(`Paternal Aunt ${i}`);
            if (paternalAunt) {
              paternalAunt.position = new go.Point(xPosition, paternalFather.location.y);
              xPosition += 100; // Adjust for next aunt
            }
          }
        }
      });
    }

    return () => {
      // Clean up the diagram on component unmount
      if (diagramRef.current.diagram) {
        diagramRef.current.diagram.clear();
      }
    };
  }, [formInfo]);

 


  return <div ref={diagramRef} style={{ width: "100%", height: "500px" }}></div>;
}
