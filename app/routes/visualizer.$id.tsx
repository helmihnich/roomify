import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { generate3DView } from '../../lib/ai.action';
import { Box, Download, RefreshCcw, Share2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const VisualizerId = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const { id } = useParams();
  const state = location.state || {};
  
  const [projectData, setProjectData] = useState<{ initialImage?: string, initialRendered?: string, name?: string }>({});

  const hasInitialGenerated = useRef(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(state.initialRendered || null)

  const handleBack = () => navigate('/')

  const initialImage = state.initialImage || projectData.initialImage;

  const runGeneration = async () =>{
    if(!initialImage) return;

    try {
      console.log("heeeeeeeeeeere");
      
      setIsProcessing(true)
      const result = await generate3DView({sourceImage: initialImage})
      console.log(result)
      if(result.renderedImage){
        setCurrentImage(result.renderedImage)
      }
    } catch (e) {
      console.error("Generation failed", e)
    } finally{
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!state.initialImage && id) {
      const fetchProject = async () => {
        try {
          // Fallback to fetch project by id
          const res = await fetch(`/api/projects/${id}`);
          if (res.ok) {
            const data = await res.json();
            setProjectData({
              initialImage: data.sourceImage || data.initialImage,
              initialRendered: data.renderedImage,
              name: data.name
            });
            if (data.renderedImage) {
              setCurrentImage(data.renderedImage);
            }
          }
        } catch (err) {
          console.error('Failed to fetch project data:', err);
        }
      };
      fetchProject();
    }
  }, [id, state.initialImage]);

  const targetRendered = state.initialRendered || projectData.initialRendered;

  useEffect(()=>{
    if(!initialImage || hasInitialGenerated.current) return;
    
    hasInitialGenerated.current = true;
    
    if (targetRendered) {
      setCurrentImage(targetRendered);
    } else {
      runGeneration();
    }
  }, [initialImage, targetRendered])
  const name = state.name || projectData.name;

  return (
    <div className="visualizer">
      <nav className='topbar'>
        <div className="brand">
          <Box className='logo'/>
          <span className='name'>Roomify</span>
        </div>
        <Button variant='ghost' size='sm' onClick={handleBack} className='exit'>
          <X className='icon'/> 
          Exit Editor
        </Button>
      </nav>
      <section className='content'>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{'Untitled Project'}</h2>
              <p className='note'>Created by you</p>
            </div>
            <div className="panel-actions">
              <Button
                size='sm'
                onClick={()=>{}}
                className='export'
                disabled={!currentImage}
                >
                  <Download className='w-4 h-4 mr-2'/>
                  Export
                </Button>
                <Button
                size='sm'
                onClick={()=>{}}
                className='share'
                >
                  <Share2 className='w-4 h-4 mr-2'/>
                  Share
                </Button>
            </div>
          </div>
          <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
            {
              currentImage ? (
                <img src={currentImage} alt="Ai Render" className='render-img'/>
              ) : (
                <div className="render-placeholder">
                  {
                    initialImage && (
                      <img src={initialImage} alt="original" className='render-fallback' />
                    )
                  }
                </div>
              )
            }
            {
              isProcessing && (
                <div className="render-overlay">
                  <div className="rendering-card">
                    <RefreshCcw className='spinner'/>
                    <span className='title'>Rendering ...</span>
                    <span className='subtitle'>Generating your 3D visualization ...</span>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </section>
    </div>
  )
}

export default VisualizerId