import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'

const VisualizerId = () => {
  const location = useLocation();
  const { id } = useParams();
  const state = location.state || {};
  
  const [projectData, setProjectData] = useState<{ initialImage?: string, name?: string }>({});

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
              name: data.name
            });
          }
        } catch (err) {
          console.error('Failed to fetch project data:', err);
        }
      };
      fetchProject();
    }
  }, [id, state.initialImage]);

  const initialImage = state.initialImage || projectData.initialImage;
  const name = state.name || projectData.name;

  return (
    <section>
      <div>{name || "Untitled Project"}</div>
      <div className="visualizer">
        {
          initialImage && (
            <div className="image-container">
              <h2>Source Image</h2>
              <img src={initialImage} alt="source" />
            </div>
          )
        }
      </div>
    </section>
  )
}

export default VisualizerId