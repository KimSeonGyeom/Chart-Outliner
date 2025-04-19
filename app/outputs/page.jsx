"use client";

import Link from 'next/link';
import GenOutputGallery from '../../components/GenOutputGallery';
import '../page.scss';

export default function OutputsPage() {
  return (
    <main className="container">
      <header>
        <Link href="/" className="main-title-link">
          Chart Outliner
        </Link>
        <span className="main-title">  
          Gen Outputs
        </span>
      </header>
      
      <GenOutputGallery />
    </main>
  );
} 