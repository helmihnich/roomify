import { Box } from 'lucide-react'
import React from 'react'
import { Button } from './ui/Button';

function Navbar() {
    const isSignedIn = true;
    const userName = "Helmi"
    const handleAuthClick = () => { }
    return (
        <header className='navbar'>
            <nav className='inner'>
                <div className='left'>
                    <div className="brand">
                        <Box className='logo' />

                        <span className='name'>
                            Roomify
                        </span>
                    </div>

                    <ul className='links'>
                        <a href='#'>Product</a>
                        <a href='#'>Pricing</a>
                        <a href='#'>Community</a>
                        <a href='#'>Enterprise</a>
                    </ul>
                </div>
                <div className="actions">
                    {
                        isSignedIn ?
                            <>
                                <span className='greeting'>
                                    {userName ? `Hi, ${userName}` : "Signed In"}
                                </span>
                                <Button size='sm' className='btn' onClick={handleAuthClick}>
                                    Log Out
                                </Button>
                            </>
                            : (
                                <>
                                    <Button size='sm' variant='ghost' onClick={handleAuthClick}>
                                        Log In
                                    </Button>
                                    <a href='#uploaded' className='cta'>Get Started</a>

                                </>
                            )
                    }
                </div>
            </nav>
        </header>
    )
}

export default Navbar