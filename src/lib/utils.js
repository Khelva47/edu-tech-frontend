import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility functions for student tracking app
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export const calculateAccuracy = (correct, total) => {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

export const getStatusColor = (status) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-800"
    case "active":
      return "bg-blue-100 text-blue-800"
    case "needs_attention":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getShapeIcon = (shape) => {
  const icons = {
    circle: "●",
    square: "■",
    triangle: "▲",
    rectangle: "▬",
  }
  return icons[shape] || "●"
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// API helper functions
export const fetchStudents = async () => {
  try {
    const response = await fetch("/api/students")
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Failed to fetch students:", error)
    return []
  }
}

export const fetchStudent = async (id) => {
  try {
    const response = await fetch(`/api/students/${id}`)
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Failed to fetch student:", error)
    return null
  }
}

export const fetchSessions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/sessions?${params}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Failed to fetch sessions:", error)
    return []
  }
}
