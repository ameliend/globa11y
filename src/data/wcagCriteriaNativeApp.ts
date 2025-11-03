export interface SpecialCase {
  type: string;
  title: string;
  description?: string;
}

export interface WCAGCriterion {
  ref_id: string;
  title: string;
  level: 'A' | 'AA';
  description: string;
  special_cases?: SpecialCase[];
}

// Native App specific WCAG criteria (48 criteria total)
export const wcagCriteriaNativeApp: WCAGCriterion[] = [
  // Perceivable
  {
    ref_id: '1.1.1',
    title: 'Non-text Content',
    level: 'A',
    description: 'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.'
  },
  {
    ref_id: '1.2.1',
    title: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    description: 'For prerecorded audio-only and prerecorded video-only media, the following are true, except when the audio or video is a media alternative for text and is clearly labeled as such.'
  },
  {
    ref_id: '1.2.2',
    title: 'Captions (Prerecorded)',
    level: 'A',
    description: 'Captions are provided for all prerecorded audio content in synchronized media, except when the media is a media alternative for text and is clearly labeled as such.'
  },
  {
    ref_id: '1.2.3',
    title: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    description: 'An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media, except when the media is a media alternative for text and is clearly labeled as such.'
  },
  {
    ref_id: '1.2.4',
    title: 'Captions (Live)',
    level: 'AA',
    description: 'Captions are provided for all live audio content in synchronized media.'
  },
  {
    ref_id: '1.2.5',
    title: 'Audio Description (Prerecorded)',
    level: 'AA',
    description: 'Audio description is provided for all prerecorded video content in synchronized media.'
  },
  {
    ref_id: '3.14',
    title: 'User controls for captions and audio description',
    level: 'A',
    description: 'For each pre-recorded synchronised time-based media, that has synchronised captions or audio description, are the control features for these alternatives presented at the same level as other primary features?'
  },
  {
    ref_id: '3.15',
    title: 'Preservation of captioning',
    level: 'A',
    description: 'For each feature that transmits, converts or records pre-recorded synchronised time-based media that has a synchronised captions track, at the end of the process, are the captions correctly preserved?'
  },
  {
    ref_id: '3.16',
    title: 'Preservation of audio description',
    level: 'A',
    description: 'For each feature that transmits, converts or records a pre-recorded synchronised time-based media with a synchronised audio description, at the end of the process, is the audio description correctly preserved?'
  },
  {
    ref_id: '3.17',
    title: 'Captions characteristics',
    level: 'A',
    description: 'For each pre-recorded time-based media, is the presentation of captions controllable by the user (excluding special cases)?'
  },
  {
    ref_id: '1.3.1',
    title: 'Info and Relationships',
    level: 'A',
    description: 'Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.'
  },
  {
    ref_id: '1.3.2',
    title: 'Meaningful Sequence',
    level: 'A',
    description: 'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.'
  },
  {
    ref_id: '1.3.3',
    title: 'Sensory Characteristics',
    level: 'A',
    description: 'Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, color, size, visual location, orientation, or sound.'
  },
  {
    ref_id: '1.3.4',
    title: 'Orientation',
    level: 'AA',
    description: 'Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific display orientation is essential.'
  },
  {
    ref_id: '1.3.5',
    title: 'Identify Input Purpose',
    level: 'AA',
    description: 'The purpose of each input field collecting information about the user can be programmatically determined when the input field serves a purpose identified in the Input Purposes for User Interface Components section.'
  },
  {
    ref_id: '1.4.1',
    title: 'Use of Color',
    level: 'A',
    description: 'Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.'
  },
  {
    ref_id: '1.4.2',
    title: 'Audio Control',
    level: 'A',
    description: 'If any audio on a Web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.'
  },
  {
    ref_id: '1.4.3',
    title: 'Contrast (Minimum)',
    level: 'AA',
    description: 'The visual presentation of text and images of text has a contrast ratio of at least 4.5:1.'
  },
  {
    ref_id: '1.4.4',
    title: 'Resize Text',
    level: 'AA',
    description: 'Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.'
  },
  {
    ref_id: '1.4.5',
    title: 'Images of Text',
    level: 'AA',
    description: 'If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.'
  },
  {
    ref_id: '1.4.10',
    title: 'Reflow',
    level: 'AA',
    description: 'Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions.'
  },
  {
    ref_id: '1.4.11',
    title: 'Non-text Contrast',
    level: 'AA',
    description: 'The visual presentation of User Interface Components and Graphical Objects have a contrast ratio of at least 3:1 against adjacent color(s).'
  },
  {
    ref_id: '1.4.12',
    title: 'Text Spacing',
    level: 'AA',
    description: 'In content implemented using markup languages that support text style properties, no loss of content or functionality occurs by setting all of the specified spacing metrics.'
  },
  {
    ref_id: '1.4.13',
    title: 'Content on Hover or Focus',
    level: 'AA',
    description: 'Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true: dismissible, hoverable, persistent.'
  },
  
  // Operable
  {
    ref_id: '2.1.1',
    title: 'Keyboard',
    level: 'A',
    description: 'All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.'
  },
  {
    ref_id: '2.1.2',
    title: 'No Keyboard Trap',
    level: 'A',
    description: 'If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface.'
  },
  {
    ref_id: '2.1.4',
    title: 'Character Key Shortcuts',
    level: 'A',
    description: 'If a keyboard shortcut is implemented in content using only letter, punctuation, number, or symbol characters, then at least one of the following is true: turn off, remap, active only on focus.'
  },
  {
    ref_id: '2.2.1',
    title: 'Timing Adjustable',
    level: 'A',
    description: 'For each time limit that is set by the content, at least one of the following is true: turn off, adjust, extend.'
  },
  {
    ref_id: '2.2.2',
    title: 'Pause, Stop, Hide',
    level: 'A',
    description: 'For moving, blinking, scrolling, or auto-updating information, all of the following are true: moving, blinking, scrolling, auto-updating.'
  },
  {
    ref_id: '2.3.1',
    title: 'Three Flashes or Below Threshold',
    level: 'A',
    description: 'Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.'
  },
  {
    ref_id: '2.4.3',
    title: 'Focus Order',
    level: 'A',
    description: 'If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.'
  },
  {
    ref_id: '2.4.4',
    title: 'Link Purpose (In Context)',
    level: 'A',
    description: 'The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.'
  },
  {
    ref_id: '2.4.6',
    title: 'Headings and Labels',
    level: 'AA',
    description: 'Headings and labels describe topic or purpose.'
  },
  {
    ref_id: '2.4.7',
    title: 'Focus Visible',
    level: 'AA',
    description: 'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.'
  },
  {
    ref_id: '2.5.1',
    title: 'Pointer Gestures',
    level: 'A',
    description: 'All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.'
  },
  {
    ref_id: '2.5.2',
    title: 'Pointer Cancellation',
    level: 'A',
    description: 'For functionality that can be operated using a single pointer, at least one of the following is true: no down-event, abort or undo, up reversal, essential.'
  },
  {
    ref_id: '2.5.3',
    title: 'Label in Name',
    level: 'A',
    description: 'For user interface components with labels that include text or images of text, the name contains the text that is presented visually.'
  },
  {
    ref_id: '2.5.4',
    title: 'Motion Actuation',
    level: 'A',
    description: 'Functionality that can be operated by device motion or user motion can also be operated by user interface components and responding to the motion can be disabled.'
  },
  
  // Understandable
  {
    ref_id: '3.1.1',
    title: 'Language of Page',
    level: 'A',
    description: 'The default human language of each Web page can be programmatically determined.'
  },
  {
    ref_id: '3.2.1',
    title: 'On Focus',
    level: 'A',
    description: 'When any user interface component receives focus, it does not initiate a change of context.'
  },
  {
    ref_id: '3.2.2',
    title: 'On Input',
    level: 'A',
    description: 'Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.'
  },
  {
    ref_id: '3.3.1',
    title: 'Error Identification',
    level: 'A',
    description: 'If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.'
  },
  {
    ref_id: '3.3.2',
    title: 'Labels or Instructions',
    level: 'A',
    description: 'Labels or instructions are provided when content requires user input.'
  },
  {
    ref_id: '3.3.3',
    title: 'Error Suggestion',
    level: 'AA',
    description: 'If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user.'
  },
  {
    ref_id: '3.3.4',
    title: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    description: 'For Web pages that cause legal commitments or financial transactions for the user to occur, that modify or delete user-controllable data in data storage systems, or that submit user test responses, at least one of the following is true: reversible, checked, confirmed.'
  },
  
  // Robust
  {
    ref_id: '4.1.2',
    title: 'Name, Role, Value',
    level: 'A',
    description: 'For all user interface components, the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.'
  },
  {
    ref_id: '4.1.3',
    title: 'Status Messages',
    level: 'AA',
    description: 'In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.'
  }
];
