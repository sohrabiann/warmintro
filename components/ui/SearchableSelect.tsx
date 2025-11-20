"use client"

import { useState, useEffect, useRef } from "react"

interface SearchableSelectProps {
    options: string[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    disabled = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredOptions, setFilteredOptions] = useState<string[]>([])
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Initialize filtered options
    useEffect(() => {
        setFilteredOptions(options)
    }, [options])

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                // If input value doesn't match selected value, reset input
                if (searchTerm !== value) {
                    setSearchTerm(value)
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [value, searchTerm])

    // Update search term when value changes externally
    useEffect(() => {
        setSearchTerm(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value
        setSearchTerm(term)
        setIsOpen(true)

        const filtered = options.filter((option) =>
            option.toLowerCase().includes(term.toLowerCase())
        )
        setFilteredOptions(filtered)
    }

    const handleOptionClick = (option: string) => {
        onChange(option)
        setSearchTerm(option)
        setIsOpen(false)
    }

    const handleFocus = () => {
        if (!disabled) {
            setIsOpen(true)
            // Reset filter on focus to show all options if search term matches value
            if (searchTerm === value) {
                setFilteredOptions(options)
            } else {
                // Otherwise filter based on current search term
                const filtered = options.filter((option) =>
                    option.toLowerCase().includes(searchTerm.toLowerCase())
                )
                setFilteredOptions(filtered)
            }
        }
    }

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
            />

            {/* Dropdown Arrow Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleOptionClick(option)}
                                className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${value === option ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                    }`}
                            >
                                {option}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">No results found</div>
                    )}
                </div>
            )}
        </div>
    )
}
