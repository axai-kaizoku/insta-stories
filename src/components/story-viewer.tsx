"use client"

import type React from "react"

import {useState, useEffect, useRef} from "react"
import type {Story} from "../App.tsx";

interface StoryViewerProps {
    stories: Story[]
    initialIndex: number
    onClose: () => void
}

export function StoryViewer({stories, initialIndex, onClose}: StoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartRef = useRef<number | null>(null)
    const touchEndRef = useRef<number | null>(null)

    const STORY_DURATION = 3000 // 3 seconds
    const PROGRESS_INTERVAL = 50 // Update every 50ms

    useEffect(() => {
        if (!isPaused) {
            startProgress()
        } else {
            stopProgress()
        }

        return () => stopProgress()
    }, [currentIndex, isPaused])

    const startProgress = () => {
        setProgress(0)
        let currentProgress = 0

        intervalRef.current = setInterval(() => {
            currentProgress += (PROGRESS_INTERVAL / STORY_DURATION) * 100
            setProgress(currentProgress)

            if (currentProgress >= 100) {
                nextStory()
            }
        }, PROGRESS_INTERVAL)
    }

    const stopProgress = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const nextStory = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            onClose()
        }
    }

    const prevStory = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.targetTouches[0].clientX
        setIsPaused(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndRef.current = e.targetTouches[0].clientX
    }

    const handleTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) {
            setIsPaused(false)
            return
        }

        const distance = touchStartRef.current - touchEndRef.current
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            nextStory()
        } else if (isRightSwipe) {
            prevStory()
        }

        touchStartRef.current = null
        touchEndRef.current = null
        setIsPaused(false)
    }

    const handleMouseDown = () => {
        setIsPaused(true)
    }

    const handleMouseUp = () => {
        setIsPaused(false)
    }

    const currentStory = stories[currentIndex]

    return (
        <div
            className="fixed inset-0 bg-black z-50 flex flex-col">
            <input
                type="text"
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape") {
                        onClose();
                    }
                }}
                className="absolute top-0 left-0 w-0 h-0 opacity-0"
                autoFocus/>
            <div className="flex gap-1 p-2">
                {stories.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{
                                width: index < currentIndex ? "100%" : index === currentIndex ? `${progress}%` : "0%",
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose()
                    }} className="text-white px-4 py-2 text-xl rounded-full hover:bg-white/5">
                    X
                </button>
            </div>

            <div
                tabIndex={0}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape") {
                        onClose();
                    }
                }}
                className="flex-1 flex items-center justify-center relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img

                    src={currentStory?.image}
                    alt="Story"
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                />

                <button
                    className="absolute left-0 top-0 w-1/3 h-full z-10 focus:outline-none"
                    onClick={prevStory}
                    disabled={currentIndex === 0}
                />
                <button className="absolute right-0 top-0 w-1/3 h-full z-10 focus:outline-none" onClick={nextStory}/>
            </div>

            <div className="p-4 text-white">
                <p className="text-sm opacity-75">{new Date(currentStory.timestamp).toLocaleString()}</p>
            </div>
        </div>
    )
}
