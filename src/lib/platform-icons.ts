// Platform icon mapping for meeting platforms
export const platformIcons: Record<string, string> = {
  'Google Meet': '/icons/meeting-platforms/google-meet.svg',
  'Zoom': '/icons/meeting-platforms/zoom.svg',
  'Microsoft Teams': '/icons/meeting-platforms/microsoft-teams.svg',
  'Skype': '/icons/meeting-platforms/skype.svg',
  'WhatsApp': '/icons/meeting-platforms/whatsapp.svg',
  'Telegram': '/icons/meeting-platforms/telegram.svg',
  'Discord': '/icons/meeting-platforms/discord.svg',
  'Slack': '/icons/meeting-platforms/slack.svg',
  'Webex': '/icons/meeting-platforms/webex.svg',
  'BlueJeans': '/icons/meeting-platforms/bluejeans.svg',
  'GoToMeeting': '/icons/meeting-platforms/gotomeeting.svg',
  'Jitsi': '/icons/meeting-platforms/jitsi.svg',
  'BigBlueButton': '/icons/meeting-platforms/bigbluebutton.svg',
  'Other': '/icons/meeting-platforms/video-call.svg',
  // Add more common platform names with proper capitalization
  'Google': '/icons/meeting-platforms/google-meet.svg',
  'Teams': '/icons/meeting-platforms/microsoft-teams.svg',
  'Meet': '/icons/meeting-platforms/google-meet.svg',
  'Hangouts': '/icons/meeting-platforms/google-meet.svg',
  'Duo': '/icons/meeting-platforms/google-meet.svg',
  'FaceTime': '/icons/meeting-platforms/video-call.svg',
  'Viber': '/icons/meeting-platforms/video-call.svg',
  'Signal': '/icons/meeting-platforms/video-call.svg',
};

// Helper function to get platform icon
export const getPlatformIcon = (platformName: string): string => {
  return platformIcons[platformName] || platformIcons['Other'];
}; 