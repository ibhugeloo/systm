import posthog from 'posthog-js';

export function trackClientOnboarded(clientId: string): void {
  posthog.capture('client_onboarded', {
    clientId,
    timestamp: new Date().toISOString(),
  });
}

export function trackMvpGenerated(clientId: string): void {
  posthog.capture('mvp_generated', {
    clientId,
    timestamp: new Date().toISOString(),
  });
}

export function trackDemoStarted(clientId: string): void {
  posthog.capture('demo_started', {
    clientId,
    timestamp: new Date().toISOString(),
  });
}

export function trackDemoModified(clientId: string, modificationCount: number): void {
  posthog.capture('demo_modified', {
    clientId,
    modificationCount,
    timestamp: new Date().toISOString(),
  });
}

export function trackHandoffSent(clientId: string): void {
  posthog.capture('handoff_sent', {
    clientId,
    timestamp: new Date().toISOString(),
  });
}

export function trackClientRequestSubmitted(clientId: string, requestType: string): void {
  posthog.capture('client_request_submitted', {
    clientId,
    requestType,
    timestamp: new Date().toISOString(),
  });
}

export function trackDealClosed(clientId: string): void {
  posthog.capture('deal_closed', {
    clientId,
    timestamp: new Date().toISOString(),
  });
}
