// Form1.js
import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import PedigreeChart from './PedigreeChart'; // Import the PedigreeChart component
import './Form1.css';
import { Diversity1 } from '@mui/icons-material';

export default function Form1() {
  const [formInfo, setFormInfo] = useState({
    name: '',
    gender: '',
    brothers: 0,
    sisters: 0,
    sons: 0,
    daughters: 0,
    maternalUncles: 0,
    maternalAunts: 0,
    paternalUncles: 0,
    paternalAunts: 0,
  });

  const [showChart, setShowChart] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Skip validation for text fields like name and gender
    if (name === 'name' || name === 'gender') {
      setFormInfo((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      // Only allow non-negative numbers for number fields
      if (value >= 0 || value === '') {
        setFormInfo((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowChart(true); // Show the chart after form submission
  };

  return (
    <div className="bro">
      <form className="forms" onSubmit={handleSubmit}>
        <div className='row0'>
        <TextField
          label="Your Name"
          name="name"
          value={formInfo.name}
          onChange={handleChange}
        />
        <TextField
          label="Your Gender"
          name="gender"
          value={formInfo.gender}
          onChange={handleChange}
        />
        </div>
        <div className='row1'>
        <TextField
          label="Brothers"
          type="number"
          name="brothers"
          value={formInfo.brothers}
          onChange={handleChange}
        />
        <TextField
          label="Sisters"
          type="number"
          name="sisters"
          value={formInfo.sisters}
          onChange={handleChange}
        />
        </div>
        <div className='row2'>
        <TextField
          label="Sons"
          type="number"
          name="sons"
          value={formInfo.sons}
          onChange={handleChange}
        />
        <TextField
          label="Daughters"
          type="number"
          name="daughters"
          value={formInfo.daughters}
          onChange={handleChange}
        />
        </div>
        <div className='row3'>
        <TextField
          label="Maternal Uncles"
          type="number"
          name="maternalUncles"
          value={formInfo.maternalUncles}
          onChange={handleChange}
        />
        <TextField
          label="Maternal Aunts"
          type="number"
          name="maternalAunts"
          value={formInfo.maternalAunts}
          onChange={handleChange}
        />
        </div>
        <div className='row4'>
        <TextField
          label="Paternal Uncles"
          type="number"
          name="paternalUncles"
          value={formInfo.paternalUncles}
          onChange={handleChange}
        />
        <TextField
          label="Paternal Aunts"
          type="number"
          name="paternalAunts"
          value={formInfo.paternalAunts}
          onChange={handleChange}
        />
        </div>
        <Button variant="contained" type="submit">
          Generate Pedigree Chart
        </Button>
      </form>

      {showChart && <PedigreeChart formInfo={formInfo} />} {/* Pass form data to PedigreeChart */}
    </div>
  );
}


