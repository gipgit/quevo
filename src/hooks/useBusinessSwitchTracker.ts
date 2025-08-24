"use client"

import { useEffect, useRef } from 'react'
import { useBusiness } from '@/lib/business-context'

export function useBusinessSwitchTracker() {
  const { currentBusiness } = useBusiness()
  const lastBusinessId = useRef<string | null>(null)
  const switchCount = useRef(0)

  useEffect(() => {
    const currentBusinessId = currentBusiness?.business_id
    
    if (currentBusinessId && lastBusinessId.current && currentBusinessId !== lastBusinessId.current) {
      // Business has changed
      switchCount.current += 1
      console.log(`Business switched from ${lastBusinessId.current} to ${currentBusinessId}`)
      
      // Store the switch information
      sessionStorage.setItem("businessSwitchTime", Date.now().toString())
      sessionStorage.setItem("businessSwitchCount", switchCount.current.toString())
      sessionStorage.setItem("lastBusinessId", lastBusinessId.current)
      sessionStorage.setItem("currentBusinessId", currentBusinessId)
    }
    
    if (currentBusinessId) {
      lastBusinessId.current = currentBusinessId
    }
  }, [currentBusiness])

  const getBusinessSwitchInfo = () => {
    const switchTime = sessionStorage.getItem("businessSwitchTime")
    const switchCountStr = sessionStorage.getItem("businessSwitchCount")
    const lastId = sessionStorage.getItem("lastBusinessId")
    const currentId = sessionStorage.getItem("currentBusinessId")
    
    return {
      switchTime: switchTime ? parseInt(switchTime) : null,
      switchCount: switchCountStr ? parseInt(switchCountStr) : 0,
      lastBusinessId: lastId,
      currentBusinessId: currentId,
      timeSinceSwitch: switchTime ? Date.now() - parseInt(switchTime) : null
    }
  }

  const clearBusinessSwitchInfo = () => {
    sessionStorage.removeItem("businessSwitchTime")
    sessionStorage.removeItem("businessSwitchCount")
    sessionStorage.removeItem("lastBusinessId")
    sessionStorage.removeItem("currentBusinessId")
  }

  return {
    getBusinessSwitchInfo,
    clearBusinessSwitchInfo,
    switchCount: switchCount.current
  }
}
