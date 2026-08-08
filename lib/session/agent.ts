'use client';

/**
 * Client-side session management for Agents.
 * 
 * Unlike the admin/manager session which uses server-side cookies,
 * the Agent session is stored in localStorage to allow for persistent
 * "pick up where you left off" behavior even if the server is cold-starting.
 */

export const AGENT_ID_KEY         = 'brainstrade_agent_id';
export const AGENT_NAME_KEY       = 'brainstrade_agent_name';
export const AGENT_STAGE_NAME_KEY = 'brainstrade_agent_stage_name';
export const AGENT_EMAIL_KEY      = 'brainstrade_agent_email';

export const MOCKUP_AGENT_ID      = 'mockup-agent';

export interface AgentSession {
  id: string;
  name: string;
  stageName: string;
  email?: string;
}

/**
 * Checks if the current session is a mockup agent.
 */
export function isMockupAgent(id?: string): boolean {
  if (id) return id === MOCKUP_AGENT_ID;
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AGENT_ID_KEY) === MOCKUP_AGENT_ID;
}

import { hasStaffSession } from './client';

/**
 * Retrieves the current agent session from localStorage.
 * If no agent session exists but a staff session is active (Admin Preview),
 * returns a virtual Admin Preview Session.
 */
export function getAgentSession(): AgentSession | null {
  if (typeof window === 'undefined') return null;

  const id        = localStorage.getItem(AGENT_ID_KEY);
  const name      = localStorage.getItem(AGENT_NAME_KEY);
  const stageName = localStorage.getItem(AGENT_STAGE_NAME_KEY) || '';
  const email     = localStorage.getItem(AGENT_EMAIL_KEY) || undefined;

  if (!id || !name) {
    if (hasStaffSession()) {
      return { id: 'admin-preview-agent', name: 'Admin Preview Agent', stageName: 'Admin Sandbox', email: 'admin@braintrade.com' };
    }
    return null;
  }

  return { id, name, stageName, email };
}

/**
 * Saves a new agent session to localStorage.
 */
export function setAgentSession(session: { id: string; name: string; stageName: string; email?: string }): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AGENT_ID_KEY, session.id);
  localStorage.setItem(AGENT_NAME_KEY, session.name);
  localStorage.setItem(AGENT_STAGE_NAME_KEY, session.stageName);
  if (session.email) {
    localStorage.setItem(AGENT_EMAIL_KEY, session.email);
  } else {
    localStorage.removeItem(AGENT_EMAIL_KEY);
  }
  window.dispatchEvent(new Event('agent-session-changed'));
}

/**
 * Clears the current agent session from localStorage.
 */
export function clearAgentSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AGENT_ID_KEY);
  localStorage.removeItem(AGENT_NAME_KEY);
  localStorage.removeItem(AGENT_STAGE_NAME_KEY);
  localStorage.removeItem(AGENT_EMAIL_KEY);
  window.dispatchEvent(new Event('agent-session-changed'));
}
