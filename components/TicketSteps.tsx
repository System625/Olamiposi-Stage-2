'use client'

import { useState } from 'react'
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
  const [currentStep, setCurrentStep] = useState(1)
  const [ticketData, setTicketData] = useState<TicketData>({
    type: null,
    numberOfTickets: '1'
  })

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
    setCurrentStep(1)
    setTicketData({
      type: null,
      numberOfTickets: '1'
    })
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