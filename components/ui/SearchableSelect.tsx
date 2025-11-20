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
                className="searchable-select-input"
            />

            {/* Dropdown Arrow Icon */}
            <div className="searchable-select-arrow">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <div className="searchable-select-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleOptionClick(option)}
                                className={`searchable-select-option ${value === option ? "searchable-select-option-selected" : ""}`}
                            >
                                {option}
                            </button>
                        ))
                    ) : (
                        <div className="searchable-select-no-results">No results found</div>
                    )}
                </div>
            )}
        </div>
    )
}
