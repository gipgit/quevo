// Shared Configuration System
// This file provides a unified way to manage action configurations

import { ActionConfig, FieldConfig } from './types';

// Registry for action configurations
const actionConfigRegistry = new Map<string, ActionConfig>();

// Register an action configuration
export function registerActionConfig(config: ActionConfig): void {
  actionConfigRegistry.set(config.actionType, config);
}

// Get an action configuration
export function getActionConfig(actionType: string): ActionConfig | null {
  return actionConfigRegistry.get(actionType) || null;
}

// Get all action configurations
export function getAllActionConfigs(): ActionConfig[] {
  return Array.from(actionConfigRegistry.values());
}

// Get available actions for a specific plan
export function getAvailableActionsForPlan(plan: number): ActionConfig[] {
  return getAllActionConfigs().filter(config => 
    config.availablePlans.includes(plan)
  );
}

// Get plan limits for an action type
export function getPlanLimits(actionType: string, plan: number): any {
  const config = getActionConfig(actionType);
  if (!config) return null;
  
  // This could be enhanced with more sophisticated plan limit logic
  return config.planLimits || {};
}

// Helper function to create field configurations
export function createFieldConfig(
  name: string,
  type: string,
  required: boolean = false,
  options: Partial<FieldConfig> = {}
): FieldConfig {
  return {
    name,
    type: type as any,
    required,
    ...options
  };
}

// Helper function to create action configurations
export function createActionConfig(
  actionType: string,
  displayName: string,
  description: string,
  icon: string,
  color: string,
  availablePlans: number[],
  fields: FieldConfig[],
  planLimits?: any
): ActionConfig {
  return {
    actionType,
    displayName,
    description,
    icon,
    color,
    availablePlans,
    fields,
    planLimits
  };
}
