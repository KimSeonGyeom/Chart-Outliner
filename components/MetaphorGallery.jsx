"use client";

import { useAiStore } from './store/aiStore.js';

export default function MetaphorGallery() {
  // Get metaphors from aiStore
  const metaphors = useAiStore(state => state.metaphors);
  const isLoading = useAiStore(state => state.isLoading);
  const setIsLoading = useAiStore(state => state.setIsLoading);
  const edgeImageData = useAiStore(state => state.edgeImageData);
  const selectedEdgeImageData = useAiStore(state => state.selectedEdgeImageData);
  const setEdgeImageData = useAiStore(state => state.setEdgeImageData);
  const setSelectedEdgeImageData = useAiStore(state => state.setSelectedEdgeImageData);
  const setAllProcessedEdgeImages = useAiStore(state => state.setAllProcessedEdgeImages);
  const processingParams = useAiStore(state => state.processingParams);
  
  // Function to process template image with Canny edge detection
  const processTemplateImage = async (template) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/process-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          template_filename: `${template["metaphorical object"]}.png` 
        }),
      });
      
      if (!response.ok) {
        console.error('Error processing template image:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.edge_image) {
        setEdgeImageData(data.edge_image);
        
        // Store top and bottom edge images
        if (data.top_edge_image) {
          useAiStore.getState().setTopEdgeImage(data.top_edge_image);
        }
        
        if (data.bottom_edge_image) {
          useAiStore.getState().setBottomEdgeImage(data.bottom_edge_image);
        }
        
        // Reset all processed edge images when selecting a new template
        setAllProcessedEdgeImages({
          default: null,
          sparsification: null,
          blur: null,
        });
        
        // After getting basic edge image, automatically process with all techniques
        await processTemplateWithEdgeTechniques(template);
      }
    } catch (error) {
      console.error('Error processing template image:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to process template with all edge techniques
  const processTemplateWithEdgeTechniques = async (template) => {
    if (!template) return;
    
    try {
      // Don't set loading again as we're already in a loading state
      
      // Process the template image with all edge techniques
      const response = await fetch('http://localhost:5000/api/process-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          template_filename: `${template["metaphorical object"]}.png`,
          processing_params: processingParams
        }),
      });
      
      if (!response.ok) {
        console.error('Error processing template image with techniques:', response.status);
        return;
      }
      
      const data = await response.json();
      
      // Update all processed edge images at once
      if (data.processed_edges) {
        setAllProcessedEdgeImages(data.processed_edges);
      }
      
      // Update top and bottom edge images
      if (data.top_edge_image) {
        useAiStore.getState().setTopEdgeImage(data.top_edge_image);
      }
      
      if (data.bottom_edge_image) {
        useAiStore.getState().setBottomEdgeImage(data.bottom_edge_image);
      }
    } catch (error) {
      console.error('Error processing template with techniques:', error);
    }
  };

  // Handle selecting a template
  const handleSelectTemplate = (metaphor) => {
    // Create template object from metaphor data
    const template = {
      name: metaphor["metaphorical object"],
      filename: `${metaphor["metaphorical object"]}.png`
    };
    
    // Set the selected template in the store
    useAiStore.getState().setSelectedTemplate(template);
    
    // Process the template image (this will also call processTemplateWithEdgeTechniques)
    processTemplateImage(metaphor);
  };
  
  // Handle selecting an edge image for bar chart pattern
  const handleSelectEdgeImage = () => {
    if (edgeImageData) {
      // Toggle selection - if already selected, deselect it
      if (selectedEdgeImageData === edgeImageData) {
        setSelectedEdgeImageData(null);
      } else {
        setSelectedEdgeImageData(edgeImageData);
      }
    }
  };
  
  return (
    <div className="metaphors-list">
      <h3>Generated Metaphors</h3>
      {metaphors.length > 0 && metaphors.map((metaphor, index) => (
        <div
          key={index}
          className="metaphor-item"
          onClick={() => handleSelectTemplate(metaphor)}
          style={{ cursor: 'pointer' }}
        >
          <span>
            <div className="template-score">
              {metaphor["metaphorical object"]}
            </div>
            <div className="template-score">
              {metaphor["prompt"]}
            </div>
          </span>
          <img 
            src={`/templates/${metaphor["metaphorical object"]}.png`} 
            alt={metaphor["metaphorical object"]}
            height={"80px"}
            className="template-thumbnail"
          />
        </div>
      ))}
      
      {metaphors.length === 0 && (
        <div className="no-metaphors">
          No metaphors generated yet. Click the "Generate Metaphors" button above.
        </div>
      )}
    </div>
  );
} 