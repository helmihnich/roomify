import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants'

interface UploadProps {
    onComplete?: (base64File: string) => Promise<boolean | void> | boolean | void
}

function Upload({ onComplete }: UploadProps = {}) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress, setProgress] = useState(0)
    const hasCompletedRef = useRef(false)

    const [base64, setBase64] = useState<string | null>(null)

    // @ts-ignore
    const {isSignedIn} = useOutletContext<AuthContext>()

    React.useEffect(() => {
        if (progress >= 100 && base64 && !hasCompletedRef.current) {
            hasCompletedRef.current = true
            const timer = setTimeout(async () => {
                if (onComplete) {
                    try {
                        await onComplete(base64)
                    } catch (error) {
                        console.error('Upload complete handler failed', error)
                    }
                }
            }, REDIRECT_DELAY_MS)
            return () => clearTimeout(timer)
        }
    }, [progress, base64, onComplete])

    const processFile = (selectedFile: File) => {
        if (!isSignedIn) return
        hasCompletedRef.current = false
        setProgress(0)
        setBase64(null)
        setFile(selectedFile)

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64Data = reader.result as string
            setBase64(base64Data)
            const intervalId = setInterval(() => {
                setProgress(prev => {
                    const nextProgress = prev + PROGRESS_STEP
                    if (nextProgress >= 100) {
                        clearInterval(intervalId)
                        return 100
                    }
                    return nextProgress
                })
            }, PROGRESS_INTERVAL_MS)
        }
        reader.readAsDataURL(selectedFile)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (!isSignedIn) return
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (!isSignedIn) return
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0])
        }
    }

    return (
        <div className='upload'>
            {
                !file ? (
                    <div 
                        className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            className='drop-input' 
                            accept='.jpg, .jpeg, .png' 
                            disabled={!isSignedIn} 
                            onChange={handleChange}
                        />
                        <div className="drop-content">
                            <div className="drop-icon">
                                <UploadIcon size={20} />
                            </div>
                            <p>
                                {
                                    isSignedIn ? (
                                        "Click to upload or just drag and drop"
                                    ) : (
                                        "Sign in or sign out with Puter to upload"
                                    )
                                }
                            </p>
                            <p className='help'>Maximum file size 50 MB.</p>
                        </div>
                    </div>
                ) : (
                    <div className="upload-status">
                        <div className="status-content">
                            <div className="status-icon">
                                {
                                    progress === 100 ? (
                                        <CheckCircle2 className='check'/>
                                    ) : (
                                        <ImageIcon className='image' />
                                    )
                                }
                            </div>
                            <h3>{file.name}</h3>
                            <div className="progress">
                                <div className="bar" style={{width:`${progress}%`}}/>
                                <p className='status-text'>
                                    {progress < 100 ? "Analyzing Floor Plan" : "Redirecting ..."}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Upload