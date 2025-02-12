'use client'

import { useState, useEffect } from 'react'
import TicketSelection from './TicketSelection'
import TicketForm from './TicketForm'
import TicketReady from './TicketReady'

interface TicketData {
  type: string | null
  numberOfTickets: string
  fullName?: string
  email?: string
  profilePhoto?: string
  message?: string
}

export default function TicketSteps() {
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [ticketData, setTicketData] = useState<TicketData>({
    type: null,
    numberOfTickets: '1'
  })

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load saved state on component mount
  useEffect(() => {
    if (mounted) {
      const savedStep = localStorage.getItem('currentStep')
      const savedTicketData = localStorage.getItem('ticketData')
      
      if (savedStep) {
        setCurrentStep(Number(savedStep))
      }
      
      if (savedTicketData) {
        setTicketData(JSON.parse(savedTicketData))
      }
    }
  }, [mounted])

  // Save state whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('currentStep', currentStep.toString())
      localStorage.setItem('ticketData', JSON.stringify(ticketData))
    }
  }, [currentStep, ticketData, mounted])

  const handleTicketSelection = (type: string, numberOfTickets: string) => {
    setTicketData(prev => ({
      ...prev,
      type,
      numberOfTickets
    }))
    setCurrentStep(2)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleFormSubmit = (formData: Partial<TicketData>) => {
    setTicketData(prev => ({
      ...prev,
      ...formData
    }))
    setCurrentStep(3)
  }

  const handleBookAnother = () => {
    if (mounted) {
      // Clear localStorage when booking another ticket
      localStorage.removeItem('currentStep')
      localStorage.removeItem('ticketData')
      localStorage.removeItem('ticketForm')
    }
    
    setCurrentStep(1)
    setTicketData({
      type: null,
      numberOfTickets: '1'
    })
  }

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-transparent border border-[#197686] rounded-3xl">
          <div className="animate-pulse bg-[#08252B] h-[500px] rounded-3xl"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentStep === 1 && (
        <TicketSelection 
          onNext={handleTicketSelection}
          selectedTicket={ticketData.type}
          numberOfTickets={ticketData.numberOfTickets}
        />
      )}
      {currentStep === 2 && (
        <TicketForm 
          onBack={handleBack}
          ticketData={ticketData}
          onTicketDataChange={setTicketData}
          onSubmit={handleFormSubmit}
        />
      )}
      {currentStep === 3 && (
        <TicketReady
          ticketData={ticketData}
          onBookAnother={handleBookAnother}
        />
      )}
    </>
  )
} 