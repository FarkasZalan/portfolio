import React, { useEffect, useRef, useState } from 'react';

// Define the interfaces for game objects
interface Fish {
    y: number;
    velocity: number;
    width: number;
    height: number;
}

interface Pipe {
    x: number;
    topHeight: number;
    bottomY: number;
    width: number;
    passed: boolean;
}

interface Score {
    name: string;
    score: number;
    date: Date;
}

const CyberFishGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null); // Ref to the canvas element
    const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
    const [gameOver, setGameOver] = useState(false); // Track if the game is over
    const [score, setScore] = useState(0); // Current score
    const [highScore, setHighScore] = useState(0); // High score
    const [playerName, setPlayerName] = useState(''); // Player's name
    const [showNameInput, setShowNameInput] = useState(true); // Show name input field
    const [highScores, setHighScores] = useState<Score[]>([]); // List of high scores
    const [isLoading, setIsLoading] = useState(false); // Loading state for high scores
    const [errorMessage, setErrorMessage] = useState(''); // Error message for user feedback
    const [nameInputError, setNameInputError] = useState(''); // Error message for name input
    const [gameName] = useState('Cyber Fish'); // Game name
    const hasSavedScore = useRef(false); // Flag to track if score has been saved
    const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]); // Refs for each row in the high score table to scroll to the current player
    const [isInitialized, setIsInitialized] = useState(false);

    // Game constants
    const GRAVITY = 0.2; // Gravity affecting the Fish
    const JUMP_FORCE = -6; // Force applied when the fish jumps
    const PIPE_WIDTH = 80; // Width of the pipes
    const INITIAL_PIPE_SPEED = 2; // Initial speed of the pipes
    const INITIAL_PIPE_INTERVAL = 180; // Initial interval between pipes
    const INITIAL_PIPE_GAP = 220; // Initial gap between pipes

    // Check if it's a small device
    const isSmallDevice = window.innerWidth < 768;

    // Game state refs (to avoid re-renders)
    const gameRef = useRef({
        fish: {
            y: 0,
            velocity: 0,
            width: isSmallDevice ? 30 : 40, // Smaller fish on small devices
            height: isSmallDevice ? 22 : 30
        } as Fish,
        pipes: [] as Pipe[],
        animationFrameId: 0,
        frameCount: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        playing: false,
        jumping: false,  // Track if fish is currently in a jump
        currentPlayerName: '',
        hoverAmplitude: 2, // Amplitude of the hovering effect
        hoverFrequency: 0.05, // Frequency of the hovering effect
        // Background star properties
        stars: [] as { x: number, y: number, size: number, speed: number }[],
        nebulas: [] as { x: number, y: number, width: number, height: number, color: string }[],
        pipeSpeed: INITIAL_PIPE_SPEED, // Dynamic pipe speed
        pipeInterval: INITIAL_PIPE_INTERVAL, // Dynamic pipe interval
        pipeGap: INITIAL_PIPE_GAP, // Dynamic pipe gap
    });

    // Fetch high scores on component mount
    useEffect(() => {
        fetchHighScores();
    }, []);

    // Fetch high scores from the API
    const fetchHighScores = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://cyber-fish-backend.onrender.com/api/scores');
            if (!response.ok) {
                throw new Error('Failed to fetch scores');
            }
            const data = await response.json();
            setHighScores(data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setErrorMessage('Failed to load high scores');
            setIsLoading(false);
        }
    };

    // Save score to the API
    const saveScore = async (name: string, scoreValue: number) => {
        try {
            const response = await fetch('https://cyber-fish-backend.onrender.com/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, score: scoreValue, date: new Date() }),
            });

            if (!response.ok) {
                throw new Error('Failed to save score');
            }

            fetchHighScores(); // Refresh high scores after saving
        } catch (error) {
            setErrorMessage('Failed to save score');
        }
    };

    // Reset row refs when high scores change
    useEffect(() => {
        rowRefs.current = rowRefs.current.slice(0, highScores.length);
    }, [highScores]);


    // Handle jump with spacebar too
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault(); // Prevent default behavior (e.g., scrolling)

                if (!gameStarted && !showNameInput) {
                    startGame(); // Start the game if it hasn't started yet
                } else if (gameRef.current.playing) {
                    jump(); // Make the fish jump if the game is already running
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameStarted, showNameInput]);

    // Update game difficulty based on score
    useEffect(() => {
        if (score > 0) {
            const speedIncrease = Math.floor(score / 5); // Increase speed every 5 points
            const gapIncrease = Math.floor(score / 10); // Increase gap every 10 points

            gameRef.current.pipeSpeed = INITIAL_PIPE_SPEED + speedIncrease * 0.5;
            gameRef.current.pipeInterval = Math.max(INITIAL_PIPE_INTERVAL - speedIncrease * 10, 100); // Minimum interval of 100
            gameRef.current.pipeGap = INITIAL_PIPE_GAP + gapIncrease * 10; // Increase gap to maintain playability
        }
    }, [score]);

    // Initialize game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            gameRef.current.canvasWidth = canvas.width;
            gameRef.current.canvasHeight = canvas.height;
            resetFish();

            // Initialize stars for parallax background
            initializeStars();

            // Initialize nebulas
            initializeNebulas();

            // Mark the game as initialized after a short delay
            setTimeout(() => {
                setIsInitialized(true);
            }, 500);

            gameLoop(); // Start rendering without starting the game
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(gameRef.current.animationFrameId);
        };
    }, []);

    // Initialize stars for the background
    const initializeStars = () => {
        const { canvasWidth, canvasHeight } = gameRef.current;
        const stars = [];

        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
            });
        }

        gameRef.current.stars = stars;
    };

    // Initialize nebula clouds for the background
    const initializeNebulas = () => {
        const { canvasWidth, canvasHeight } = gameRef.current;
        const nebulas = [];

        // Create 3-5 nebula clouds
        const nebulaCount = Math.floor(Math.random() * 3) + 3;
        const nebulaColors = [
            'rgba(138, 43, 226, 0.2)',
            'rgba(75, 0, 130, 0.15)',
            'rgba(0, 191, 255, 0.15)',
            'rgba(255, 0, 255, 0.1)',
        ];

        for (let i = 0; i < nebulaCount; i++) {
            nebulas.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                width: Math.random() * 300 + 200,
                height: Math.random() * 200 + 100,
                color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
            });
        }

        gameRef.current.nebulas = nebulas;
    };

    // Reset FIsh position
    const resetFish = () => {
        const { canvasHeight } = gameRef.current;
        gameRef.current.fish.y = canvasHeight / 2 - gameRef.current.fish.height / 2;
        gameRef.current.fish.velocity = 0;

        // Force the fish to stay in place until game starts
        if (!gameRef.current.playing) {
            gameRef.current.fish.y = canvasHeight / 2 - gameRef.current.fish.height / 2;
        }
    };

    // Reset game state
    const resetGame = () => {
        gameRef.current.pipes = [];
        gameRef.current.frameCount = 0;
        setScore(0);
        setGameOver(false);
        setGameStarted(false);

        // Reset fish position and explicitly set velocity to 0
        gameRef.current.fish.y = gameRef.current.canvasHeight / 2 - gameRef.current.fish.height / 2;
        gameRef.current.fish.velocity = 0;

        // Reset dynamic difficulty variables
        gameRef.current.pipeSpeed = INITIAL_PIPE_SPEED;
        gameRef.current.pipeInterval = INITIAL_PIPE_INTERVAL;
        gameRef.current.pipeGap = INITIAL_PIPE_GAP;

        // Force the game loop to run and redraw the canvas
        if (!gameRef.current.animationFrameId) {
            gameLoop();
        }
    };

    // Handle name submission
    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim()) {
            const nameExists = await checkNameExists(playerName.trim());
            if (nameExists) {
                setNameInputError('Name already exists. Please choose a different name.');
                setErrorMessage('');
            } else {
                gameRef.current.currentPlayerName = playerName.trim();
                setShowNameInput(false);
                setErrorMessage(''); // Clear any previous error message
                setNameInputError('');
            }
        }
    };

    // Check if a player name already exists in the high scores
    const checkNameExists = async (name: string): Promise<boolean> => {
        try {
            const response = await fetch(`https://cyber-fish-backend.onrender.com/api/scores/check-name?name=${encodeURIComponent(name)}`);
            if (!response.ok) {
                throw new Error('Failed to check name');
            }
            const data = await response.json();
            return data.exists; // Assuming the API returns { exists: boolean }
        } catch (error) {
            console.error(error);
            setNameInputError('Failed to check name:');
            return false;
        }
    };

    // Start the game
    const startGame = () => {
        hasSavedScore.current = false;
        if (!gameRef.current.currentPlayerName) {
            setErrorMessage('Please enter your name to start the game.');
            return;
        }

        if (gameOver) {
            resetGame();
        }

        if (!gameRef.current.playing) {
            // Reset fish position and velocity one more time before starting
            gameRef.current.fish.y = gameRef.current.canvasHeight / 2 - gameRef.current.fish.height / 2;
            gameRef.current.fish.velocity = 0;

            // Set a small delay before activating physics
            setTimeout(() => {
                gameRef.current.playing = true;
                setGameStarted(true);
                setGameOver(false);
                if (!gameRef.current.animationFrameId) {
                    gameLoop();
                }
            }, 300); // 300ms delay
        }
    };

    // Make the fish jump
    const jump = () => {
        if (gameRef.current.playing && !gameRef.current.jumping) {
            gameRef.current.fish.velocity = JUMP_FORCE;
            gameRef.current.jumping = true;

            setTimeout(() => {
                gameRef.current.jumping = false;
            }, 100);
        }
    };

    // Handle game input (click, tap or spacebar)
    const handleInput = () => {
        if (!isInitialized) {
            return;
        }

        if (!gameRef.current.currentPlayerName) {
            setErrorMessage('Please enter your name to start the game.');
            return;
        }

        if (!gameStarted) {
            startGame(); // Start game on first input
        } else {
            jump();
        }
    };

    // Create a pipe
    const createPipe = () => {
        const { canvasHeight, canvasWidth, pipeGap } = gameRef.current;
        const minHeight = 50;
        const maxHeight = canvasHeight - pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        return {
            x: canvasWidth,
            topHeight,
            bottomY: topHeight + pipeGap,
            width: PIPE_WIDTH,
            passed: false,
        };
    };

    // Check collisions
    const checkCollisions = () => {
        const { fish, pipes, canvasHeight } = gameRef.current;

        // Check if fish hit the ground or ceiling
        if (fish.y + fish.height >= canvasHeight || fish.y <= 0) {
            return true;
        }

        // Check pipe collisions with more forgiving hitbox
        const hitboxReduction = 0.2;
        const fishHitboxX = 50 + fish.width * hitboxReduction;
        const fishHitboxY = fish.y + fish.height * hitboxReduction / 2;
        const fishHitboxWidth = fish.width * (1 - hitboxReduction);
        const fishHitboxHeight = fish.height * (1 - hitboxReduction);

        for (const pipe of pipes) {
            // Top pipe collision
            if (
                fishHitboxY < pipe.topHeight &&
                fishHitboxX < pipe.x + pipe.width &&
                fishHitboxX + fishHitboxWidth > pipe.x
            ) {
                return true;
            }

            // Bottom pipe collision
            if (
                fishHitboxY + fishHitboxHeight > pipe.bottomY &&
                fishHitboxX < pipe.x + pipe.width &&
                fishHitboxX + fishHitboxWidth > pipe.x
            ) {
                return true;
            }
        }

        return false;
    };

    // Draw a fish
    const drawFish = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
        ctx.save();

        // Draw body with a sleek, futuristic shape
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + width - 10, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + 10);
        ctx.lineTo(x + width, y + height - 10);
        ctx.quadraticCurveTo(x + width, y + height, x + width - 10, y + height);
        ctx.lineTo(x + 10, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - 10);
        ctx.lineTo(x, y + 10);
        ctx.quadraticCurveTo(x, y, x + 10, y);
        ctx.closePath();
        ctx.fill();

        // Add eye with a futuristic glow
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + width - 15, y + height / 2 - 5, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + width - 13, y + height / 2 - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Add a glowing tail with a gradient effect
        const gradient = ctx.createLinearGradient(x - 30, y + height / 2, x, y + height / 2);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#ff00ff');

        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x - 30, y + height / 2 - 15);
        ctx.lineTo(x - 30, y + height / 2 + 15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    // Draw a pipe
    const drawPipe = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, isTop: boolean) => {
        const capHeight = 20;
        const capWidth = width + 20;

        // Draw pipe body with gradient
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.3, '#ff00ff');
        gradient.addColorStop(0.6, '#9400d3');
        gradient.addColorStop(1, '#00ff7f');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Draw pipe cap
        ctx.fillStyle = '#00ddbb';
        if (isTop) {
            ctx.fillRect(x - 10, y + height - capHeight, capWidth, capHeight);
        } else {
            ctx.fillRect(x - 10, y, capWidth, capHeight);
        }

        // Add glow effect
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(0, 255, 204, 0.5)';
        ctx.fillRect(x, y, width, height);
        ctx.shadowBlur = 0;
    };

    // Draw the background with stars and nebulas
    const drawBackground = (ctx: CanvasRenderingContext2D) => {
        const { canvasWidth, canvasHeight, stars, nebulas, playing } = gameRef.current;

        // Draw dark blue gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        bgGradient.addColorStop(0, '#000033');
        bgGradient.addColorStop(0.5, '#000028');
        bgGradient.addColorStop(1, '#000020');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw nebulas
        nebulas.forEach(nebula => {
            ctx.save();
            const nebulaGradient = ctx.createRadialGradient(
                nebula.x + nebula.width / 2,
                nebula.y + nebula.height / 2,
                10,
                nebula.x + nebula.width / 2,
                nebula.y + nebula.height / 2,
                nebula.width / 2
            );
            nebulaGradient.addColorStop(0, nebula.color);
            nebulaGradient.addColorStop(1, 'rgba(0,0,30,0)');

            ctx.fillStyle = nebulaGradient;
            ctx.beginPath();
            ctx.ellipse(
                nebula.x + nebula.width / 2,
                nebula.y + nebula.height / 2,
                nebula.width / 2,
                nebula.height / 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();
            ctx.restore();

            // Move nebulas slowly if playing
            if (playing) {
                nebula.x -= 0.1;

                // Reset nebula position when it goes off screen
                if (nebula.x + nebula.width < 0) {
                    nebula.x = canvasWidth;
                    nebula.y = Math.random() * canvasHeight;
                }
            }
        });

        // Draw stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Add subtle twinkle effect
            if (Math.random() > 0.99) {
                ctx.save();
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Move stars at different speeds if playing (parallax effect)
            if (playing) {
                star.x -= star.speed;

                // Reset star position when it goes off screen
                if (star.x < 0) {
                    star.x = canvasWidth;
                    star.y = Math.random() * canvasHeight;
                }
            }
        });
    };

    // Game loop
    const gameLoop = () => {
        const { fish, pipes, canvasWidth, canvasHeight, hoverAmplitude, hoverFrequency, pipeSpeed, pipeInterval } = gameRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw the background with stars and nebulas
        drawBackground(ctx);

        // Update fish position for hovering effect
        if (!gameRef.current.playing) {
            // Only apply hover effect if initialized
            if (isInitialized) {
                fish.y = canvasHeight / 2 - fish.height / 2 + Math.sin(gameRef.current.frameCount * hoverFrequency) * hoverAmplitude;
            } else {
                // Keep fish in center until initialized
                fish.y = canvasHeight / 2 - fish.height / 2;
            }
            // Always reset velocity when not playing
            fish.velocity = 0;
        } else {
            // Update fish with gravity only when playing
            fish.velocity += GRAVITY;
            fish.y += fish.velocity;
        }

        // Draw fish
        drawFish(ctx, 50, fish.y, fish.width, fish.height);

        // Draw pipes
        if (gameRef.current.playing) {
            gameRef.current.frameCount++;
            if (gameRef.current.frameCount % pipeInterval === 0) {
                gameRef.current.pipes.push(createPipe());
            }

            // Update and draw pipes
            for (let i = 0; i < pipes.length; i++) {
                const pipe = pipes[i];

                // Move pipe
                pipe.x -= pipeSpeed;

                // Draw top pipe
                drawPipe(ctx, pipe.x, 0, pipe.width, pipe.topHeight, true);

                // Draw bottom pipe
                drawPipe(ctx, pipe.x, pipe.bottomY, pipe.width, canvasHeight - pipe.bottomY, false);

                // Check if pipe is passed
                if (!pipe.passed && pipe.x + pipe.width < 50) {
                    pipe.passed = true;
                    setScore((prevScore) => {
                        const newScore = prevScore + 1;
                        if (newScore > highScore) {
                            setHighScore(newScore);
                        }
                        return newScore;
                    });
                }

                // Remove pipes that are off screen
                if (pipe.x + pipe.width < 0) {
                    pipes.splice(i, 1);
                    i--;
                }
            }
        }

        // Check collisions
        if (gameRef.current.playing && checkCollisions()) {
            setScore((currentScore) => {
                // Save score to database if not already saved
                if (gameRef.current.currentPlayerName && currentScore > 0 && !hasSavedScore.current) {
                    saveScore(gameRef.current.currentPlayerName, currentScore);
                    hasSavedScore.current = true;
                }
                return currentScore; // Return the same score, no change needed
            });

            // Update game state
            gameRef.current.playing = false;
            setGameOver(true);

            cancelAnimationFrame(gameRef.current.animationFrameId);
            gameRef.current.animationFrameId = 0;
            return;
        }

        // Continue game loop
        gameRef.current.animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Render high scores table
    const renderHighScores = () => {
        return (
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-90 rounded-lg p-3 max-h-48 overflow-y-auto border border-gray-700 high-scores-table">
                {/* Table Header */}
                <h3 className="text-cyan-400 text-lg font-semibold mb-2">Top Fish</h3>
                {isLoading ? (
                    // Loading state
                    <p className="text-indigo-300">Loading scores...</p>
                ) : errorMessage ? (
                    // Error state
                    <p className="text-red-400">{errorMessage}</p>
                ) : highScores.length > 0 ? (
                    // High scores table
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-cyan-300">
                                <th className="pb-1">Rank</th>
                                <th className="pb-1">Fish</th>
                                <th className="pb-1 text-right">Score</th>
                                <th className="pb-1 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {highScores.map((entry, index) => {
                                const isCurrentPlayer = entry.name === gameRef.current.currentPlayerName;
                                const rowClass = `
                                ${isCurrentPlayer ? 'current-player' : ''}
                                high-score-row
                            `;

                                // Medal icons for top 3 players
                                const rankDisplay =
                                    index === 0 ? (
                                        <span className="text-yellow-400 text-xl">🥇</span>
                                    ) : index === 1 ? (
                                        <span className="text-gray-300 text-xl">🥈</span>
                                    ) : index === 2 ? (
                                        <span className="text-amber-700 text-xl">🥉</span>
                                    ) : (
                                        index + 1
                                    );

                                return (
                                    <tr
                                        key={index}
                                        ref={(el) => (rowRefs.current[index] = el)} // Assign ref to each row for scrolling
                                        className={`${rowClass} text-indigo-200 border-t border-indigo-800`}
                                    >
                                        <td className="py-1">{rankDisplay}</td>
                                        <td className="py-1 truncate max-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap" title={entry.name}>
                                            {entry.name}
                                        </td>
                                        <td className="py-1 text-right">{entry.score}</td>
                                        <td className="py-1 text-right">{new Date(entry.date).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    // No scores state
                    <p className="text-indigo-300">No scores yet. Be the first!</p>
                )}
            </div>
        );
    };

    // Render the futuristic name input screen
    const renderFuturisticNameInput = () => {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60">
                {/* Animated Grid Background */}
                <div className="absolute inset-0 overflow-hidden"
                    style={{
                        background: `
                        linear-gradient(160deg, rgba(0, 0, 75, 0.9), rgba(99, 2, 75, 0.95)),
                        url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300ffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='50' cy='50' r='5'/%3E%3Ccircle cx='10' cy='10' r='3'/%3E%3Ccircle cx='90' cy='90' r='3'/%3E%3Ccircle cx='30' cy='70' r='2'/%3E%3Ccircle cx='70' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E"),
                        radial-gradient(circle, rgba(4, 255, 255, 0.1) 10%, transparent 20%),
                        radial-gradient(circle, rgba(50, 255, 255, 0.05) 20%, transparent 30%)
                    `,
                        backgroundSize: 'cover, 40px 40px, 200px 200px, 300px 300px'
                    }}>
                </div>

                {/* Holographic Container */}
                <div className="relative z-10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-md rounded-2xl p-8 max-w-md border border-cyan-500/30 shadow-2xl">
                    {/* Scan lines effect */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,255,255,0.05) 2px, rgba(0,255,255,0.05) 4px)',
                            mixBlendMode: 'overlay'
                        }}>
                    </div>

                    {/* Header with tech glow */}
                    <div className="text-center mb-8 relative">
                        <div className="absolute -inset-1 bg-cyan-500/20 blur-lg rounded-full"></div>
                        <h3 className="text-cyan-400 text-3xl font-bold mb-2 relative">CYBER FISH NICKNAME</h3>
                        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full my-3"></div>
                        <p className="text-indigo-300 relative">Activate your aquatic avatar</p>
                    </div>

                    {/* Form for name input */}
                    <form onSubmit={handleNameSubmit} className="flex flex-col items-center relative z-20">
                        <div className="relative w-full mb-6">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30"></div>
                            <input
                                type="text"
                                placeholder="ENTER YOUR CYBER NAME"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="relative px-4 py-3 bg-black/70 text-cyan-300 rounded-lg border border-cyan-500/50 focus:outline-none focus:ring focus:ring-purple-500/50 w-full placeholder-cyan-600 font-mono tracking-wide"
                            />
                        </div>

                        {nameInputError && (
                            <div className="text-red-400 mb-4 font-mono text-sm w-full bg-red-900/20 border border-red-800 rounded p-2">
                                {nameInputError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="relative px-8 py-3 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500/80 hover:to-indigo-500/80 text-white rounded-lg focus:outline-none transform transition hover:scale-105 w-full overflow-hidden group cursor-pointer"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                            <span className="absolute left-0 w-8 h-full bg-white/20 transform -skew-x-30 -translate-x-10 group-hover:translate-x-32 transition-transform ease-out duration-700"></span>
                            <span className="relative font-bold tracking-wide">LAUNCH INTO THE GALACTIC OCEAN</span>
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div id="cyber-fish" className="w-full max-w-4xl mx-auto p-4">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 shadow-2xl border border-indigo-700">
                {/* Game Title */}
                <h2 className="text-3xl text-center mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{gameName}</h2>

                {/* Canvas Container */}
                <div className="relative w-full" style={{ paddingBottom: '60%', minHeight: '300px', height: '60vh' }}>
                    <canvas
                        ref={canvasRef}
                        onClick={handleInput}
                        className="absolute inset-0 w-full h-full border rounded-lg border-indigo-500 bg-gradient-to-b from-black via-blue-950 to-purple-950"
                        style={{ minHeight: '300px', height: '60vh' }}
                    />

                    {/* Name Input Screen */}
                    {showNameInput && renderFuturisticNameInput()}

                    {/* Start Game Screen */}
                    {!gameStarted && !showNameInput && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center" onClick={startGame}>
                            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30">
                                <p className="text-cyan-400 text-4xl mb-2 font-bold text-center">Ready to swim, {gameRef.current.currentPlayerName}?</p>
                                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full my-4"></div>
                                <p className="text-indigo-300 text-xl text-center">Click or press <span className="font-bold">Space</span> to dive into the galactic ocean</p>
                            </div>
                        </div>
                    )}

                    {/* Game Over Screen */}
                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-gradient-to-r from-indigo-900/70 to-purple-900/70 p-6 sm:p-8 rounded-xl border border-red-500/30 shadow-lg w-11/12 sm:max-w-md text-center">
                                <p className="text-red-500 text-2xl sm:text-3xl mb-2 font-bold">FISH TERMINATED!</p>
                                <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-full my-4"></div>
                                <p className="text-cyan-400 text-xl sm:text-2xl mb-2">Score: {score}</p>
                                <p className="text-purple-400 text-lg sm:text-xl mb-6">High Score: {highScore}</p>
                                <button
                                    onClick={resetGame}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full focus:ring focus:ring-purple-500/50 transition transform hover:scale-105 cursor-pointer"
                                >
                                    Swim Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Score Display */}
                    {!gameOver && !showNameInput && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-full text-cyan-400 border border-cyan-500/30">
                            Score: {score}
                        </div>
                    )}
                </div>

                {/* Game Instructions */}
                <div className="mt-4 text-center text-sm text-indigo-300">
                    Click or press <span className="font-bold">Space</span> to swim through the neon gates
                </div>

                {/* Layout for High Scores and Navigation Guide */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-b from-black to-purple-950 bg-opacity-70 backdrop-blur-sm rounded-lg p-4 h-full border border-indigo-800/50">
                            <h3 className="text-cyan-400 text-lg font-semibold mb-2">Navigation Guide</h3>
                            <ul className="text-indigo-300 list-disc pl-5 space-y-2">
                                <li>Click or press <span className="font-bold">Space</span> or tap to swim forward</li>
                                <li>Navigate through the neon gates</li>
                                <li>Each gate passed earns you 1 point</li>
                                <li>Avoid collisions with gates and boundaries</li>
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {renderHighScores()}

                        {/* Scroll to Current Player's Score Button */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => {
                                    const currentPlayerIndex = highScores.findIndex(
                                        (entry) => entry.name === gameRef.current.currentPlayerName
                                    );
                                    if (currentPlayerIndex !== -1) {
                                        rowRefs.current[currentPlayerIndex]?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'center',
                                        });
                                    }
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white rounded-full focus:ring focus:ring-blue-400/50 transition transform hover:scale-105 cursor-pointer text-lg font-semibold shadow-lg"
                            >
                                Scroll to My Score
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
            @keyframes gridMove {
                0% { background-position: 0 0; }
                100% { background-position: 40px 40px; }
            }

            @media (max-width: 768px) {
                .text-4xl {
                    font-size: 2rem;
                }
                .text-xl {
                    font-size: 1rem;
                }
                .text-lg {
                    font-size: 1.125rem;
                }
                .text-sm {
                    font-size: 0.875rem;
                }
            }
        `}</style>
        </div>
    );
};

export default CyberFishGame;