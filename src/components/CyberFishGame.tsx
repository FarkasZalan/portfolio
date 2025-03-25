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
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isSavingScore, setIsSavingScore] = useState(false);


    // Check if it's a small device
    const isSmallDevice = window.innerWidth < 768;

    // Game constants
    const GRAVITY = 0.2; // Gravity affecting the Fish
    const JUMP_FORCE = -6; // Force applied when the fish jumps
    const PIPE_WIDTH = 80; // Width of the pipes
    const INITIAL_PIPE_SPEED = isSmallDevice ? 3 : 2; // Faster speed on small devices
    const INITIAL_PIPE_INTERVAL = isSmallDevice ? 150 : 180; // Smaller interval on small devices
    const INITIAL_PIPE_GAP = isSmallDevice ? 200 : 220; // Smaller gap on small devices

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
            setErrorMessage('');

            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('https://portfolio-4wgj.onrender.com/api/scores', {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to fetch scores');
            }

            const data = await response.json();
            setHighScores(data);
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            if (error.name === 'AbortError') {
                setErrorMessage('Server is waking up. Scores will load shortly.');
            } else {
                setErrorMessage('Failed to load high scores');
            }
        }
    };

    // Save score to the API
    const saveScore = async (name: string, scoreValue: number) => {
        try {
            setIsSavingScore(true);
            setErrorMessage('');

            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('https://portfolio-4wgj.onrender.com/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, score: scoreValue, date: new Date() }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to save score');
            }

            fetchHighScores(); // Refresh high scores after saving
            setIsSavingScore(false);
        } catch (error: any) {
            setIsSavingScore(false);
            if (error.name === 'AbortError') {
                setErrorMessage('Server is waking up. Your score will be saved shortly.');
            } else {
                setErrorMessage('Failed to save score. Please try again.');
            }
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

            // Apply a multiplier for small devices
            const smallDeviceMultiplier = isSmallDevice ? 1.2 : 1;

            gameRef.current.pipeSpeed = (INITIAL_PIPE_SPEED + speedIncrease * 0.5) * smallDeviceMultiplier;
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
            setIsCheckingName(true);
            setNameInputError('');

            // Add a timeout for the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(
                `https://portfolio-4wgj.onrender.com/api/scores/check-name?name=${encodeURIComponent(name)}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to check name');
            }

            const data = await response.json();
            setIsCheckingName(false);
            return data.exists;
        } catch (error: any) {
            setIsCheckingName(false);
            if (error.name === 'AbortError') {
                setNameInputError('Server is waking up. Please try again in a moment.');
            } else {
                setNameInputError('Failed to check name. Please try again.');
            }
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
                {/* Table Header with Connection Status */}
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-cyan-400 text-lg font-semibold">Top Fish</h3>
                    <div className="flex items-center">
                        <div
                            className={`w-2 h-2 rounded-full mr-1 ${isLoading || isCheckingName || isSavingScore ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}
                            title={isLoading || isCheckingName || isSavingScore ? 'Connecting to server...' : 'Server connected'}
                        ></div>
                        <span className="text-xs text-indigo-300">
                            {isLoading || isCheckingName || isSavingScore ? 'Connecting...' : 'Online'}
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-indigo-300 text-sm">
                            {errorMessage || "Connecting to galactic database..."}
                        </p>
                        {errorMessage && (
                            <button
                                onClick={fetchHighScores}
                                className="mt-2 px-3 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-xs cursor-pointer"
                            >
                                Retry Connection
                            </button>
                        )}
                    </div>
                ) : errorMessage ? (
                    // Error State
                    <div className="text-center py-4">
                        <p className="text-red-400 mb-2">{errorMessage}</p>
                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={fetchHighScores}
                                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-sm cursor-pointer"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => setErrorMessage('')}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : highScores.length > 0 ? (
                    // High Scores Table
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
                                ${isCurrentPlayer ? 'bg-indigo-900/30' : ''}
                                high-score-row
                                border-t border-indigo-800
                            `;

                                // Medal icons for top 3 players
                                const rankDisplay =
                                    index === 0 ? (
                                        <span className="text-yellow-400">🥇</span>
                                    ) : index === 1 ? (
                                        <span className="text-gray-300">🥈</span>
                                    ) : index === 2 ? (
                                        <span className="text-amber-700">🥉</span>
                                    ) : (
                                        index + 1
                                    );

                                return (
                                    <tr
                                        key={index}
                                        ref={(el) => (rowRefs.current[index] = el)}
                                        className={`${rowClass} text-indigo-200`}
                                    >
                                        <td className="py-1 px-1">{rankDisplay}</td>
                                        <td className="py-1 px-1 truncate max-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap"
                                            title={entry.name}>
                                            {entry.name}
                                        </td>
                                        <td className="py-1 px-1 text-right">{entry.score}</td>
                                        <td className="py-1 px-1 text-right text-xs">
                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    // No Scores State
                    <div className="text-center py-4">
                        <p className="text-indigo-300 mb-2">No scores yet. Be the first!</p>
                        {gameRef.current.currentPlayerName && !gameStarted && (
                            <button
                                onClick={startGame}
                                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-sm cursor-pointer"
                            >
                                Start Playing
                            </button>
                        )}
                    </div>
                )}

                {/* Current Player Indicator */}
                {gameRef.current.currentPlayerName && highScores.length > 0 && (
                    <div className="text-xs text-cyan-400 mt-2 text-center">
                        {highScores.some(e => e.name === gameRef.current.currentPlayerName) ? (
                            <span>Your score is highlighted</span>
                        ) : (
                            <span>Play to add your score to the leaderboard</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Render the futuristic name input screen
    const renderFuturisticNameInput = () => {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
                {/* Animated Grid Background */}
                <div className="absolute inset-0 overflow-hidden opacity-70"
                    style={{
                        background: `
                        linear-gradient(160deg, rgba(0, 0, 75, 0.9), rgba(99, 2, 75, 0.95)),
                        url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300ffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='50' cy='50' r='5'/%3E%3Ccircle cx='10' cy='10' r='3'/%3E%3Ccircle cx='90' cy='90' r='3'/%3E%3Ccircle cx='30' cy='70' r='2'/%3E%3Ccircle cx='70' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E"),
                        radial-gradient(circle, rgba(4, 255, 255, 0.1) 10%, transparent 20%),
                        radial-gradient(circle, rgba(50, 255, 255, 0.05) 20%, transparent 30%)
                    `,
                        backgroundSize: 'cover, 40px 40px, 200px 200px, 300px 300px',
                        animation: 'gridMove 10s linear infinite'
                    }}>
                </div>

                {/* Connection Status Indicator (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center">
                    <div
                        className={`w-2 h-2 rounded-full mr-2 ${isCheckingName ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}
                        title={isCheckingName ? 'Verifying name...' : 'Server connected'}
                    ></div>
                    <span className="text-xs text-cyan-300">
                        {isCheckingName ? 'Verifying...' : 'Online'}
                    </span>
                </div>

                {/* Holographic Container */}
                <div className="relative z-10 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-md w-11/12 border border-cyan-500/40 shadow-2xl neon-glow">
                    {/* Scan lines effect */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,255,255,0.05) 2px, rgba(0,255,255,0.05) 4px)',
                            mixBlendMode: 'overlay'
                        }}>
                    </div>

                    {/* Glowing border animation */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 border-2 border-transparent animate-border-pulse"></div>
                    </div>

                    {/* Header with tech glow */}
                    <div className="text-center mb-6 relative">
                        <div className="absolute -inset-1 bg-cyan-500/20 blur-lg rounded-full"></div>
                        <h3 className="text-cyan-300 text-2xl sm:text-3xl font-bold mb-2 relative tracking-wider">
                            CYBER FISH IDENTIFICATION
                        </h3>
                        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full my-3"></div>
                        <p className="text-indigo-300 relative text-sm sm:text-base">
                            Register your aquatic avatar identity
                        </p>
                    </div>

                    {/* Form for name input */}
                    <form onSubmit={handleNameSubmit} className="flex flex-col items-center relative z-20">
                        <div className="relative w-full mb-4">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30 animate-glow-pulse"></div>
                            <input
                                type="text"
                                placeholder="ENTER YOUR CYBER NAME"
                                value={playerName}
                                onChange={(e) => {
                                    setPlayerName(e.target.value);
                                    setNameInputError('');
                                }}
                                className="relative px-4 py-3 bg-black/80 text-cyan-200 rounded-lg border border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full placeholder-cyan-600/70 font-mono tracking-wide text-sm sm:text-base"
                                maxLength={20}
                                disabled={isCheckingName}
                            />
                            {playerName && (
                                <div className="absolute right-3 top-3 text-xs text-cyan-500/70">
                                    {20 - playerName.length}
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {(nameInputError || errorMessage) && (
                            <div className={`w-full mb-4 p-2 rounded-lg text-sm font-mono ${nameInputError ? 'bg-red-900/30 border border-red-700/50 text-red-300' :
                                'bg-yellow-900/30 border border-yellow-700/50 text-yellow-300'
                                }`}>
                                {nameInputError || errorMessage}
                                <button
                                    onClick={() => {
                                        setNameInputError('');
                                        setErrorMessage('');
                                    }}
                                    className="float-right text-xs px-2 py-0.5 bg-black/20 hover:bg-black/40 rounded"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!playerName.trim() || isCheckingName}
                            className={`relative px-6 py-3 w-full rounded-lg focus:outline-none transform transition overflow-hidden group ${isCheckingName ? 'bg-indigo-800 cursor-wait' :
                                'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500/80 hover:to-indigo-500/80 cursor-pointer hover:scale-[1.02]'
                                }`}
                        >
                            {isCheckingName ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-white font-bold tracking-wider text-sm sm:text-base">
                                        VERIFYING IDENTITY...
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                                    <span className="absolute left-0 w-8 h-full bg-white/20 transform -skew-x-30 -translate-x-10 group-hover:translate-x-32 transition-transform duration-700 ease-out"></span>
                                    <span className="relative text-white font-bold tracking-wider text-sm sm:text-base">
                                        ACTIVATE CYBER FISH
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Character Limit Hint */}
                        <div className="text-xs text-indigo-400 mt-3">
                            Max 20 characters. No special symbols.
                        </div>
                    </form>
                </div>

                {/* CSS for animations */}
                <style>{`
                @keyframes gridMove {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                }
                @keyframes border-pulse {
                    0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); }
                    50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.7); }
                    100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); }
                }
                .animate-border-pulse {
                    animation: border-pulse 2s infinite;
                }
                @keyframes glow-pulse {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                    100% { opacity: 0.3; }
                }
                .animate-glow-pulse {
                    animation: glow-pulse 3s infinite;
                }
                .neon-glow {
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
                }
            `}</style>
            </div>
        );
    };

    return (
        <div id="cyber-fish" className="w-full max-w-4xl mx-auto p-4">
            {/* Main Game Container */}
            <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 rounded-xl p-4 shadow-2xl border border-indigo-700/50">
                {/* Game Title */}
                <h2 className="text-3xl text-center mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider">
                    {gameName}
                </h2>

                {/* Canvas Container */}
                <div className="relative w-full" style={{ paddingBottom: '60%', minHeight: '300px', height: '60vh' }}>
                    <canvas
                        ref={canvasRef}
                        onClick={handleInput}
                        className="absolute inset-0 w-full h-full border rounded-xl border-indigo-500/50 bg-gradient-to-br from-black via-blue-950/80 to-purple-950/80"
                        style={{ minHeight: '300px', height: '60vh' }}
                    />

                    {/* Name Input Screen */}
                    {showNameInput && renderFuturisticNameInput()}

                    {/* Start Game Screen */}
                    {!gameStarted && !showNameInput && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center" onClick={startGame}>
                            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30 shadow-lg max-w-md w-11/12 text-center">
                                <p className="text-cyan-300 text-2xl sm:text-3xl mb-3 font-bold">
                                    Ready to swim, <span className="text-purple-300">{gameRef.current.currentPlayerName}</span>?
                                </p>
                                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full my-4"></div>
                                <p className="text-indigo-300 text-lg mb-4">
                                    Navigate through the neon gates
                                </p>
                                <div className="flex flex-col space-y-3 mt-6">
                                    <button
                                        onClick={startGame}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full focus:ring-2 focus:ring-purple-500/50 transition transform hover:scale-105 cursor-pointer font-bold tracking-wide"
                                    >
                                        BEGIN MISSION
                                    </button>
                                    <button
                                        onClick={() => setShowNameInput(true)}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-full text-sm transition"
                                    >
                                        Change Player Name
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Over Screen */}
                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 p-6 sm:p-8 rounded-xl border border-red-500/40 shadow-2xl w-11/12 sm:max-w-md text-center">
                                <p className="text-red-400 text-2xl sm:text-3xl mb-3 font-bold tracking-wider">FISH TERMINATED!</p>
                                <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent w-full my-4"></div>

                                <div className="flex justify-center space-x-8 mb-6">
                                    <div className="text-center">
                                        <p className="text-cyan-300 text-sm">SCORE</p>
                                        <p className="text-2xl font-bold">{score}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-purple-300 text-sm">HIGH SCORE</p>
                                        <p className="text-2xl font-bold">{highScore}</p>
                                    </div>
                                </div>

                                {isSavingScore && (
                                    <div className="mb-6 flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-cyan-300 text-sm">Securing your place in history...</span>
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="mb-4 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-300 text-sm">
                                        {errorMessage}
                                        <button
                                            onClick={() => setErrorMessage('')}
                                            className="float-right text-xs px-2 py-0.5 bg-black/20 hover:bg-black/40 rounded"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col space-y-3">
                                    <button
                                        onClick={resetGame}
                                        disabled={isSavingScore}
                                        className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full focus:ring-2 focus:ring-purple-500/50 transition font-bold tracking-wide ${isSavingScore ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-500 hover:to-indigo-500 hover:scale-105'
                                            }`}
                                    >
                                        {isSavingScore ? 'PROCESSING...' : 'SWIM AGAIN'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNameInput(true);
                                            resetGame();
                                        }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-full text-sm transition"
                                    >
                                        New Player
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Score Display */}
                    {!gameOver && !showNameInput && (
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-cyan-300 border border-cyan-500/30 flex items-center">
                            <span className="mr-2">SCORE:</span>
                            <span className="font-bold">{score}</span>
                        </div>
                    )}

                    {/* Connection Status (Game View) */}
                    {!showNameInput && (
                        <div className="absolute top-3 left-3 flex items-center">
                            <div
                                className={`w-2 h-2 rounded-full mr-2 ${isLoading || isCheckingName || isSavingScore ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
                                    }`}
                            ></div>
                            <span className="text-xs text-indigo-300">
                                {isLoading || isCheckingName || isSavingScore ? 'Connecting...' : 'Online'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Game Instructions */}
                <div className="mt-4 text-center text-sm text-indigo-300/80">
                    <p>Click or press <span className="font-bold text-cyan-300">SPACE</span> to swim through the neon gates</p>
                    {isSmallDevice && (
                        <p className="text-xs mt-1">Tilt device for better control</p>
                    )}
                </div>

                {/* Layout for High Scores and Navigation Guide */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Navigation Guide */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-black/70 to-purple-950/70 backdrop-blur-sm rounded-xl p-4 h-full border border-indigo-800/50">
                            <h3 className="text-cyan-400 text-lg font-semibold mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                NAVIGATION GUIDE
                            </h3>
                            <ul className="text-indigo-300/90 space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span className="bg-cyan-500/20 rounded-full p-1 mr-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </span>
                                    <span>Click or <span className="font-bold text-cyan-300">SPACE</span> to swim forward</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-cyan-500/20 rounded-full p-1 mr-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </span>
                                    <span>Navigate through the neon gates</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-cyan-500/20 rounded-full p-1 mr-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </span>
                                    <span>Each gate passed earns you <span className="font-bold text-purple-300">1 point</span></span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-cyan-500/20 rounded-full p-1 mr-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </span>
                                    <span>Avoid collisions with gates and boundaries</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* High Scores */}
                    <div className="lg:col-span-2 space-y-4">
                        {renderHighScores()}

                        {/* Scroll to Current Player's Score Button */}
                        {highScores.some(entry => entry.name === gameRef.current.currentPlayerName) && (
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
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-500/80 hover:to-indigo-500/80 text-white rounded-xl focus:outline-none transition transform hover:scale-[1.02] cursor-pointer flex items-center justify-center cursor-pointer"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                </svg>
                                FIND MY SCORE
                            </button>
                        )}

                        {/* Refresh Scores Button */}
                        <button
                            onClick={fetchHighScores}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 bg-gray-800 hover:bg-gray-700/80 text-indigo-300 rounded-xl transition flex items-center justify-center cursor-pointer ${isLoading ? 'opacity-50 cursor-wait' : ''
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    REFRESHING...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    REFRESH LEADERBOARD
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
        `}</style>
        </div>
    );
};

export default CyberFishGame;