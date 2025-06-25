"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Plus, Search, Shield, AlertTriangle, Eye, Trash2, Edit, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/router"

interface Enemy {
  id: string
  name: string
  grudgeLevel: number // 1-10
  description: string
  avatar?: string
}

export default function EnemiesList() {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEnemy, setEditingEnemy] = useState<Enemy | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newEnemy, setNewEnemy] = useState<Partial<Enemy>>({
    name: "",
    grudgeLevel: 5,
    description: "",
  })
  const [darkMode, setDarkMode] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(
      savedMode ? savedMode === 'true' : systemPrefersDark
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetch("/api/enemies")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setEnemies(data);
          } else {
            console.error("Unexpected response:", data);
            setEnemies([]); // fallback to empty array
          }
        });
    }
  }, [status]);

  if (status === 'loading') {
    return <div className="dark:bg-gray-900 dark:text-white">Loading...</div>
  }
  if (!session) {
    return (
      <div className="dark:bg-gray-900 dark:text-white">
        Please Sign In
      </div>
    );
  }


  const filteredEnemies = enemies.filter(
    (enemy) =>
      enemy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enemy.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getGrudgeColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800"
    if (level <= 5) return "bg-yellow-100 text-yellow-800"
    if (level <= 7) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const getGrudgeIcon = (level: number) => {
    if (level <= 3) return <Shield className="w-4 h-4" />
    if (level <= 5) return <Eye className="w-4 h-4" />
    if (level <= 7) return <AlertTriangle className="w-4 h-4" />
    return <Flame className="w-4 h-4" />
  }

  const getGrudgeIntensity = (level: number) => {
    if (level <= 3) return "Mild"
    if (level <= 5) return "Moderate"
    if (level <= 7) return "High"
    return "Extreme"
  }

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/login', // Your login page path
      redirect: true // Let NextAuth handle the redirect
    });
    
    // Optional: Clear any local state if needed
    setEnemies([]);
  };

  const handleAddEnemy = async () => {
    if (newEnemy.name) {
      const response = await fetch("/api/enemies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEnemy,
          grudgeLevel: newEnemy.grudgeLevel || 5,
          avatar: "/placeholder.svg?height=40&width=40",
        }),
      }) 
      if (response.ok) {
        const addedEnemy = await response.json()
        setEnemies((prev) => [...prev, 
          { 
            id: addedEnemy._id,
            name: newEnemy.name!,
            grudgeLevel: newEnemy.grudgeLevel || 5,
            description: newEnemy.description || "",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        ])
        setNewEnemy({
          name: "",
          grudgeLevel: 5,
          description: "",
        })
        setIsAddDialogOpen(false)
      }
    }
  }

  const handleEditEnemy = async () => {
    if (!editingEnemy) return;

    try {
      const response = await fetch(`/api/enemies/?id=${editingEnemy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingEnemy.name,
          grudgeLevel: editingEnemy.grudgeLevel,
          description: editingEnemy.description,
          avatar: editingEnemy.avatar,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update enemy:", await response.text());
        return;
      }

      const updatedEnemy = await response.json();

      setEnemies((prev) =>
        prev.map((enemy) =>
          enemy.id === updatedEnemy.id ? updatedEnemy : enemy
        )
      );
      setIsEditDialogOpen(false);
      setEditingEnemy(null);
    } catch (error) {
      console.error("Error while saving enemy:", error);
    }
  };



  const handleDeleteEnemy = async (id: string) => {
    const response = await fetch(`/api/enemies/?id=${id}`, { method: "DELETE" })
    if (response.ok) {
      setEnemies((prev) => prev.filter((enemy) => enemy.id !== id))
    }
  }

  const averageGrudge =
    enemies.length > 0 ? (enemies.reduce((sum, enemy) => sum + enemy.grudgeLevel, 0) / enemies.length).toFixed(1) : "0"

  const grudgeStats = {
    mild: enemies.filter((e) => e.grudgeLevel <= 3).length,
    moderate: enemies.filter((e) => e.grudgeLevel > 3 && e.grudgeLevel <= 5).length,
    high: enemies.filter((e) => e.grudgeLevel > 5 && e.grudgeLevel <= 7).length,
    extreme: enemies.filter((e) => e.grudgeLevel > 7).length,
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} p-4`}>
    
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* Header with logout button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">🎯 My Enemies List</h1>
            <p className="text-gray-600 dark:text-gray-300">Keep your friends close, and your enemies... well, documented.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant='outline'
              onClick={() => {
                const newMode = !darkMode;
                setDarkMode(newMode);
                localStorage.setItem('darkMode', newMode.toString());
                document.documentElement.classList.toggle('dark', newMode);
              }}
              className="mt-1"
            > 
              {darkMode ? '☀️' : '🌙'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="mt-1 dark:text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Enemies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{enemies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Average Grudge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{averageGrudge}/10</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Mild (1-3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{grudgeStats.mild}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">High (6-7)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{grudgeStats.high}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Extreme (8-10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{grudgeStats.extreme}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search enemies by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Enemy
              </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-[425px] ${darkMode ? "dark bg-gray-800" : "bg-white"}`}>
              <DialogHeader>
                <DialogTitle className="dark:text-white">Add New Enemy</DialogTitle>
                <DialogDescription>Document a new adversary for your records.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="dark:text-gray-400">Name</Label>
                  <Input
                    id="name"
                    value={newEnemy.name}
                    onChange={(e) => setNewEnemy({ ...newEnemy, name: e.target.value })}
                    placeholder="Enter enemy name"
                    className="dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grudgeLevel" className="dark:text-gray-400">
                    Grudge Level: {newEnemy.grudgeLevel}/10 ({getGrudgeIntensity(newEnemy.grudgeLevel || 5)})
                  </Label>
                  <Slider
                    id="grudgeLevel"
                    min={1}
                    max={10}
                    step={1}
                    value={[newEnemy.grudgeLevel || 5]}
                    onValueChange={(value) => setNewEnemy({ ...newEnemy, grudgeLevel: value[0] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Mild annoyance)</span>
                    <span>10 (Pure hatred)</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="dark:text-gray-400">Description</Label>
                  <Textarea
                    id="description"
                    value={newEnemy.description}
                    onChange={(e) => setNewEnemy({ ...newEnemy, description: e.target.value })}
                    placeholder="What did they do to earn a spot on your list?"
                    rows={4}
                    className="dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEnemy} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">Add Enemy</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enemies List */}
        <div className="grid gap-4">
          {filteredEnemies.length === 0 ? (
            <Card className="dark:bg-gray-800">
              <CardContent className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? "No enemies match your search." : "No enemies documented yet. Lucky you! 🍀"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEnemies.map((enemy) => (
              <Card key={enemy.id} className="hover:shadow-md transition-shadow w-full overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6 relative">
                  {/* Absolute positioned buttons */}
                  <div className="absolute right-6 top-6 flex flex-col gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingEnemy(enemy);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`sm:max-w-[425px] ${darkMode ? "dark bg-gray-800" : "bg-white"}`}>
                        <DialogHeader>
                          <DialogTitle className="dark:text-white">Edit Enemy</DialogTitle>
                          <DialogDescription>Update enemy information.</DialogDescription>
                        </DialogHeader>
                        {editingEnemy && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name" className="dark:text-gray-400">Name</Label>
                              <Input
                                id="edit-name"
                                value={editingEnemy.name}
                                onChange={(e) => setEditingEnemy({ ...editingEnemy, name: e.target.value })}
                                className="dark:text-white"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-grudge" className="dark:text-gray-400">
                                Grudge Level: {editingEnemy.grudgeLevel}/10 (
                                {getGrudgeIntensity(editingEnemy.grudgeLevel)})
                              </Label>
                              <Slider
                                id="edit-grudge"
                                min={1}
                                max={10}
                                step={1}
                                value={[editingEnemy.grudgeLevel]}
                                onValueChange={(value) => setEditingEnemy({ ...editingEnemy, grudgeLevel: value[0] })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1 (Mild annoyance)</span>
                                <span>10 (Pure hatred)</span>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description" className="dark:text-gray-400">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editingEnemy.description}
                                onChange={(e) => setEditingEnemy({ ...editingEnemy, description: e.target.value })}
                                rows={4}
                                className="dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button onClick={handleEditEnemy} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteEnemy(enemy.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content with strict width constraints */}
                  <div className="flex gap-4 pr-10">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={enemy.avatar || "/placeholder.svg"} alt={enemy.name} />
                      <AvatarFallback className="dark:bg-gray-700">
                        {enemy.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                          {enemy.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${getGrudgeColor(enemy.grudgeLevel)} flex items-center gap-1`}>
                          {getGrudgeIcon(enemy.grudgeLevel)}
                          {enemy.grudgeLevel}/10
                        </Badge>
                        <span className="text-sm text-gray-500">
                          ({getGrudgeIntensity(enemy.grudgeLevel)})
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                        <p>{enemy.description}</p>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            enemy.grudgeLevel <= 3
                              ? "bg-green-500"
                              : enemy.grudgeLevel <= 5
                                ? "bg-yellow-500"
                                : enemy.grudgeLevel <= 7
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${(enemy.grudgeLevel / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>⚠️ This is a satirical application. ⚠️</p>
          <p>Remember: The best revenge is living well! 😊</p>
        </div>
      </div>
    </div>
  )
}