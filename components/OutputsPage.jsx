"use client";

import React from 'react';
import GenOutputGallery from './GenOutputGallery';
import { useUIStore } from './store/uiStore';

const OutputsPage = () => {
  return (
    <div className="outputs-container">
      <GenOutputGallery />
    </div>
  );
};

export default OutputsPage; 