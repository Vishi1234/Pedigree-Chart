import React, { useState, useEffect, useRef } from 'react';
import Form1 from './components/Form1'; // Import Form1 component
import * as d3 from 'd3'; // Import D3.js
import './App.css';

function App() {
  const [familyData, setFamilyData] = useState(null);
  const chartRef = useRef(null);

  const handleFormSubmit = (data) => {
    setFamilyData(data);
  };

  const generatePedigree = () => {
    if (!familyData) return;

    // Create the family tree structure with grandparents, parents, siblings, and the user.
    const familyTree = {
      name: familyData.name,
      gender: familyData.gender === 'Male' ? 'M' : 'F',
      children: [],  // This will hold the user and their siblings
      parents: {
        father: {
          name: 'Father', // Placeholder, user needs to input father name if necessary
          gender: 'M',
          children: [], // This will hold the paternal side children (including the user)
          parents: {
            paternalGrandfather: { name: 'Paternal Grandfather', gender: 'M', children: [] },
            paternalGrandmother: { name: 'Paternal Grandmother', gender: 'F', children: [] },
          },
        },
        mother: {
          name: 'Mother', // Placeholder, user needs to input mother name if necessary
          gender: 'F',
          children: [], // This will hold the maternal side children (including the user)
          parents: {
            maternalGrandfather: { name: 'Maternal Grandfather', gender: 'M', children: [] },
            maternalGrandmother: { name: 'Maternal Grandmother', gender: 'F', children: [] },
          },
        },
      },
    };

    // Add siblings (brothers and sisters) to the user
    const allSiblings = [
      ...Array.from({ length: parseInt(familyData.brothers) }, (_, i) => ({
        name: `Brother ${i + 1}`,
        gender: 'M',
        children: [],
      })),
      ...Array.from({ length: parseInt(familyData.sisters) }, (_, i) => ({
        name: `Sister ${i + 1}`,
        gender: 'F',
        children: [],
      })),
    ];

    // Add the user itself to the siblings list
    allSiblings.push({
      name: familyData.name,
      gender: familyData.gender === 'Male' ? 'M' : 'F',
      children: [],
    });

    // Add siblings under the user (this is the lowest generation)
    familyTree.children = allSiblings;

    // Add uncles and aunts (both paternal and maternal)
    familyTree.parents.father.children.push(...Array.from({ length: parseInt(familyData.paternalUncles) }, (_, i) => ({
      name: `Paternal Uncle/Aunt ${i + 1}`,
      gender: i % 2 === 0 ? 'M' : 'F',
      children: [],
    })));

    familyTree.parents.mother.children.push(...Array.from({ length: parseInt(familyData.maternalUncles) }, (_, i) => ({
      name: `Maternal Uncle/Aunt ${i + 1}`,
      gender: i % 2 === 0 ? 'M' : 'F',
      children: [],
    })));

    return familyTree;
  };

  useEffect(() => {
    if (familyData) {
      const familyTree = generatePedigree();

      // Set up the margin and dimensions for the chart
      const width = 1000;
      const height = 800;
      const margin = { top: 20, right: 120, bottom: 20, left: 120 };

      const svg = d3
        .select(chartRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

      const root = d3.hierarchy(familyTree);
      const treeData = treeLayout(root);

      // Create links (lines between nodes)
      svg
        .selectAll('.link')
        .data(treeData.links())
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2);

      // Create nodes (family members)
      const nodes = svg
        .selectAll('.node')
        .data(treeData.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');

      // Add circles for females and squares for males
      nodes
        .append('circle')
        .attr('r', 20)
        .attr('fill', (d) => (d.data.gender === 'M' ? 'lightblue' : 'lightpink'))
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('class', (d) => (d.data.gender === 'M' ? 'male-node' : 'female-node'));

      nodes
        .append('rect')
        .attr('width', 40)
        .attr('height', 40)
        .attr('x', -20)
        .attr('y', -20)
        .attr('fill', (d) => (d.data.gender === 'M' ? 'lightblue' : 'none'))
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .style('display', (d) => (d.data.gender === 'M' ? 'block' : 'none'));

      // Add text labels to nodes
      nodes
        .append('text')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text((d) => d.data.name);
    }
  }, [familyData]);

  return (
    <div className="App">
      <Form1 onSubmit={handleFormSubmit} />
      <div ref={chartRef} style={{ width: '100%', height: '600px' }}></div>
    </div>
  );
}

export default App;





