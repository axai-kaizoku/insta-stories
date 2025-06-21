import {useEffect, useRef, useState} from "react";
import {StoryViewer} from "./components/story-viewer.tsx";

export type Story = {
    id: string
    image: string
    timestamp: number
}

function App() {
    const [stories, setStories] = useState<Story[]>([])
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)

    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAllStories()
    }, [])

    const fetchAllStories = () => {
        try {
            const storedStories = localStorage.getItem("stories");
            if (storedStories) {
                const parsedStories: Story[] = JSON.parse(storedStories)
                const now = Date.now()
                const validStories = parsedStories.filter((story) => now - story.timestamp < 24 * 60 * 60 * 1000)

                if (validStories.length !== parsedStories.length) {
                    localStorage.setItem("stories", JSON.stringify(validStories))
                }

                setStories(validStories)
            }
        } catch {
            return null
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")
                if (!ctx) return

                let {width, height} = img
                const maxWidth = 1080
                const maxHeight = 1920

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height)
                    width *= ratio
                    height *= ratio
                }

                canvas.width = width
                canvas.height = height
                ctx.drawImage(img, 0, 0, width, height)

                const base64 = canvas.toDataURL("image/jpeg", 0.8)

                const newStory: Story = {
                    id: crypto.randomUUID(),
                    image: base64,
                    timestamp: Date.now(),
                }

                const updatedStories = [newStory, ...stories]
                setStories(updatedStories)

                localStorage.setItem("stories", JSON.stringify(updatedStories))
            }

            img.src = e.target?.result as string
        }

        for (let file of files) {
            reader.readAsDataURL(file)
        }

        e.target.value = ""
    }

    const handleStoryClick = (index: number) => {
        setSelectedStoryIndex(index)
    }

    const handleCloseViewer = () => {
        setSelectedStoryIndex(null)
    }


    return (
        <main className="h-screen w-full flex min-h-screen flex-col bg-neutral-800">
            <section className=" max-w-7xl flex flex-col w-full grow p-5 mx-auto ">
                <div className="h-20 border-b border-neutral-500 w-full flex items-center justify-between">
                    <h1 className="text-4xl font-medium">Insta Stories</h1>
                    <button type={"submit"} onClick={() => {
                        ref?.current?.click()
                    }} className={"px-3.5 ring pt-1 pb-2 text-2xl rounded-full"}>+
                    </button>
                    <input className="hidden" ref={ref} type={"file"} multiple accept={"image/*"}
                           onChange={handleFileUpload}/>
                </div>
                <div className="flex gap-3.5 overflow-x-auto w-full items-center px-2 py-4">

                    {stories?.map((story, i) => (
                        <div key={i} className="size-16 rounded-full ring shrink-0 grow-0" onClick={() => handleStoryClick(i)}>
                            <img src={story.image} alt={story.id} className="rounded-full object-cover size-full"/>
                        </div>
                    ))}

                </div>
                {selectedStoryIndex !== null && (
                    <StoryViewer stories={stories} initialIndex={selectedStoryIndex} onClose={handleCloseViewer}/>
                )}
            </section>
        </main>
    )
}

export default App
