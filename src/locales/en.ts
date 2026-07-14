export const en = {
  translation: {
    lang: 'en',
    'date-locale': 'en-US',
    link: '/en{{- href}}',
  },
  'landing-page': {
    description:
      'DiceSpec is a service that collects little tools for TRPGs. Tools such as dice prediction, dice rolling, and log analysis are available for free.',
    catchphrase: 'DiceSpec is a service that collects little tools for TRPGs.',
    'try-it-out': 'Try it out!',
    features: {
      label: 'Features of DiceSpec',
    },
    characteristics: {
      label: 'Characteristics of DiceSpec',
      0: {
        label: 'Completely Free',
        contents: 'There is no charge for using DiceSpec.',
      },
      1: {
        label: 'Lightweight Operation',
        contents: 'DiceSpec is designed with performance in mind, so there is hardly any waiting time for processing.',
      },
      2: {
        label: 'Open Source',
        contents:
          'DiceSpec is developed entirely as open source, so anyone can freely view and propose modifications. So users can use it with confidence.',
      },
    },
    credit: 'Credit',
  },
  expect: {
    usage1:
      'By calculating the expected value of a die, such as `1d6` or `1d100`, you can predict what the result will be when you roll the die.',
    usage2: 'In addition, by entering `1d100<=10` or `2d6>=10`, the probability can also be known.',
    input: {
      placeholder: 'Please enter a formula',
      calculation: 'Calculate',
      'calculation-error': 'Calculation failed. Please check the calculation formula.',
      'auto-recalculation-option': 'Automatic recalculation upon change',
    },
    stats: {
      chance: 'Probability',
      mean: 'Mean',
      ci: 'Confidence Interval (P95)',
      sd: 'Standard Deviation',
      variance: 'Variance',
      range: 'Range',
    },
    'system-specific': {
      title: 'System-specific predictions',
      description: 'Calculate success chances and outcome distributions based on system-specific rules.',
    },
  },
  dice: {
    usage: 'In simple mode, you can roll basic dice, and in advanced mode, you can roll dice for various game systems.',
    simple: {
      label: 'Simple',
      output: 'The result will be displayed here',
      'reset-dice': 'Reset',
      'roll-dice': 'Roll Dice',
      increment: 'Increase {{dice}}',
      decrement: 'Decrease {{dice}}',
    },
    advanced: {
      label: 'Advanced',
      'game-system': {
        label: 'Game System',
        button: 'Select a game system',
        search: 'Search for a game system',
        'no-result': 'No game system found.',
      },
      output: 'Output',
      'quick-input': {
        'add-favorite': 'Save {{command}} to favorite',
        'remove-favorite': 'Remove {{command}} from favorite',
        'migration-announcement':
          '<l>Old App</l> migration does not carry over history or favorites. If necessary, please re-register using the <l>Old App</l> as a reference.',
      },
      input: {
        'error-failed': 'Roll failed. Please review the command',
        'error-invalid': 'The command format is invalid',
        placeholder: 'Enter a command',
        'roll-dice': 'Roll Dice',
      },
      error: 'Dice roll failed',
      'dicebot-usage': 'How to use "{{systemName}}"',
      'advanced-settings': {
        label: 'Advanced Settings',
        'show-help': 'Show Help',
        'enable-sound': 'Play Sound',
        volume: 'Volume',
        'bcdice-server': 'BCDice Server',
        'migration-announcement':
          '<l>Old App</l> migration does not carry over settings. If necessary, please reconfigure using the <l>Old App</l> as a reference.',
      },
    },
  },
  'analyze-logs': {
    usage1: 'Analyze the logs of Cocoforia to calculate the expected value of the dice, etc.',
    list: {
      'sign-in-required': 'Sign in to use this feature.',
      'tab-mine': 'My analyses',
      'tab-public': 'Public analyses',
      filters: {
        'system-placeholder': 'Game system',
        'character-placeholder': 'Character',
        'sort-placeholder': 'Sort',
        'all-systems': 'All systems',
      },
      sort: {
        newest: 'Newest first',
        oldest: 'Oldest first',
        deviationScoreDesc: 'Highest deviation score',
        deviationScoreAsc: 'Lowest deviation score',
      },
      state: {
        loading: 'Loading...',
        'no-results': 'No results found.',
        failed: 'Failed to load analysis results.',
        empty: 'No analyses yet.',
      },
      'load-more': 'Load more',
      retry: 'Retry',
      card: {
        'deviation-score': 'Dice Deviation Score',
      },
    },
    save: {
      title: 'Save and Share',
      'sign-in-required': 'Sign in to save analyses.',
      'title-label': 'Title',
      'title-placeholder': 'Scenario name, etc.',
      'session-date-label': 'Session date',
      visibility: {
        label: 'Visibility',
        private: 'Private',
        unlisted: 'Unlisted',
        public: 'Public',
      },
      'show-record-details-label': 'Show record details',
      'limit-free': 'Free plan allows up to {{limit}} saves (currently {{count}} saved)',
      'limit-reached-message': 'You have reached the save limit.',
      'upgrade-to-pro': 'Upgrade to Pro plan for unlimited saves.',
      'upgrade-button': 'Upgrade to Pro',
      'save-button': 'Save',
      saving: 'Saving...',
      failed: {
        title: 'Failed to save',
        description: 'An error occurred while saving. Please try again later.',
      },
      'go-to-list': 'Go to Analysis List',
    },
    detail: {
      title: 'Log Analysis Result',
      'not-found': 'Analysis not found.',
      'not-found-description': 'The requested analysis does not exist or may have been deleted.',
      'back-to-list': 'Back to analysis list',
      edit: 'Edit',
      delete: 'Delete',
      private: 'This analysis is private.',
      'records-owner-only': 'This section is private.',
      'no-logs': 'No logs were saved.',
      'load-failed': 'Failed to load the analysis.',
      'records-load-failed': 'Failed to load the dice logs.',
    },
    'edit-dialog': {
      title: 'Edit analysis',
      description: 'You can change the title and visibility settings.',
      'title-label': 'Title',
      'title-placeholder': 'Enter a title',
      'visibility-label': 'Visibility',
      visibility: {
        private: 'Private (only me)',
        unlisted: 'Unlisted (anyone with link)',
        public: 'Public (shown in list)',
      },
      'session-date-label': 'Session date',
      'show-record-details-label': 'Show dice logs',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving',
      failed: 'Failed to update the analysis.',
    },
    'delete-dialog': {
      title: 'Delete analysis',
      description: 'This action cannot be undone. Are you sure you want to delete it?',
      cancel: 'Cancel',
      delete: 'Delete',
      deleting: 'Deleting',
      failed: 'Failed to delete the analysis.',
    },
    'game-system-request': {
      label: 'New Game System Request',
      system: 'Game System',
      logs: 'Log File (optional)',
      'logs-description': 'Having a log file makes it easier to support!',
      submit: 'Submit',
      submitted: 'Request submitted!',
      'submitted-description': 'Thank you for your request!',
      error: 'Failed to submit request',
      'already-implemented': 'This game system has already been implemented.',
    },
    upload: {
      button: 'Click to upload or drag and drop to upload',
      'add-button': 'Add log',
      'clear-button': 'Remove selected logs',
      'button-mouseover': 'Release and upload',
      'current-file': 'Currently selected file',
    },
    'game-system-select': {
      label: 'Select a game system',
    },
    'character-select': {
      label: 'Select a character',
    },
    'tab-select': {
      label: 'Select tabs to analyze',
      all: 'All',
      empty: 'Upload logs to select tabs.',
    },
    error: 'An error occurred during analysis. Please make sure you have uploaded the correct log file.',
    stats: {
      mean: 'Mean',
      'success-rate': 'Success Rate',
      'roll-count': 'Number of dice rolled',
      'roll-count-unit': '',
      'dice-count-unit': '',
      share: 'Share analysis results',
    },
    'skill-summary': {
      label: 'Skill Summary',
      skill: 'Skill',
      target: 'Target',
      'roll-count': 'Rolls',
      'success-count': 'Successes',
      'success-rate': 'Success Rate',
      'no-data': 'No skill rolls available for summary.',
      untagged: 'Unknown Skill',
      paywall: {
        title: 'Detailed skill summary is available on PRO plan',
        cta: 'Start PRO Plan',
      },
    },
    'share-analysis-result': {
      title: 'Share analysis results',
      'scenario-name': 'Scenario name (optional)',
      'scenario-name-description': 'Displayed in the title section of the image',
      'scenario-name-default': 'Analysis Results',
      'share-image': 'Share image',
      'image-alt': 'Preview of the share image for analysis results',
      'share-text':
        '▼Your analyzed dice results▼\n\nMean: {{average}}\nDice deviation score: {{deviationScore}}\nSuccess rate: {{successRate}}\nDice rolls: {{diceRollCount}}\n\n#DiceSpec\n',
      'share-image-failed': 'Failed to share image',
      'share-image-failed-description': 'Failed to generate or upload the image. Please try again later.',
    },
    chart: {
      top: 'Top',
    },
    log: 'Dice Logs',
  },
  ccfolia: {
    usage:
      'This tool formats the character\'s items into a format that can be output to Cocoforia. It can also be used to read from Cocoforia output format, so it is useful when you want to "change a little bit of this value!"',
    'load-clipboard': {
      button: 'Load from clipboard',
      error: 'Failed to load from clipboard',
      'error-description': 'Failed to load from clipboard. Please check the format of the copied text.',
    },
    input: {
      name: {
        label: 'Name',
        placeholder: 'Character Name',
      },
      memo: {
        label: 'Memo',
        placeholder: 'Memo',
      },
      initiative: {
        label: 'Initiative',
        placeholder: 'Initiative',
        description:
          'The order in which the character acts in a battle. It is often used to determine the order of action.',
      },
      'external-url': {
        label: 'Reference URL',
        placeholder: 'https://example.com/some_character',
        description: 'A URL that can be used to refer to the character.',
      },
      status: {
        label: 'Status',
        description:
          'Set the statuses that fluctuate in conjunction with your character, such as HP and MP. You can refer to the current value from the chat by saying {label name}.',
        'status-label': 'Label',
        'status-value': 'Current Value',
        'status-max': 'Max Value',
        add: 'Add new status',
      },
      params: {
        label: 'Parameter',
        description:
          "Set parameters that rarely change, such as a character's ability value. You can refer to the value from the chat by saying {label name}.",
        'param-label': 'Label',
        'param-value': 'Value',
        add: 'Add new parameter',
      },
      color: {
        label: 'Chat Color',
        character: 'Character 1',
        time: 'Today 13:04',
        message: "This is a test message. The color is reflected in the character's name.",
      },
      commands: {
        label: 'Chat Palette',
        placeholder: 'CC<=70 【Spot hidden】',
        description:
          'This command can be entered quickly from the chat when a character is selected. You can refer to the value of a status parameter by doing something like {attack power}.',
      },
    },
    result: 'Export Result',
    'copy-to-clipboard': 'Copy to clipboard',
  },
  common: {
    announcement: {
      label: 'Announcement',
      migration:
        'DiceSpec has migrated to <target>{{target}}</target>. Existing features can still be used without any issues.',
      oldAppMigration: 'Your app is an old version. The latest DiceSpec has migrated to <target>{{target}}</target>.',
      close: 'Close announcement',
    },
    header: {
      'app-name': 'DiceSpec',
      'feedback-button': 'Feedback',
      feedback: {
        title: 'Feedback',
        description: 'Please feel free to give us your feedback.',
        name: 'Name (optional)',
        feedback: 'Feedback',
        submit: 'Submit',
        submitted: 'Feedback submitted!',
        'submitted-description': 'Thank you for your feedback!',
        error: 'Failed to submit feedback',
      },
    },
    expect: {
      title: 'Dice Expecter',
      description:
        'Calculate the expected value of the dice, etc. You can predict what kind of result you will get when you roll the dice.',
    },
    dice: {
      title: 'Dice Roll',
      description: 'Roll the dice. You can also use the command to roll the dice, such as "1d6" or "2d6+3".',
    },
    'analyze-logs': {
      title: 'Log Analyzer',
      description:
        'Analyze Cocoforia\'s logs to calculate dice averages, etc. You may be thinking, "I feel like I had bad luck with dice this session, but what really happened?" If you are thinking, "I think I had bad luck with dice this session, but what really happened?',
    },
    'analysis-list': {
      title: 'Analysis List',
      description: 'You can review your saved log analyses here.',
    },
    'blog-callout': {
      title: 'Now serializing: "Probability & Statistics for TRPG Players"!',
      points: {
        0: 'A gentle 6-part guide to probability and statistics for TRPG players.',
        1: 'Written with readability first, so you can breeze through it.',
        2: 'Practical insights you can start using right away.',
      },
    },
    ccfolia: { title: 'CCFOLIA Export' },
    error: {
      message: 'An unexpected error occurred.',
      reload: 'Reload Page',
    },
  },
  legal: {
    'back-to-top': 'Back to top page',
    terms: {
      metadata: {
        title: 'Terms of Service',
        description: 'Terms of Service for using DiceSpec.',
      },
      title: 'Terms of Service',
    },
    privacy: {
      metadata: {
        title: 'Privacy Policy',
        description: 'Privacy Policy for DiceSpec users.',
      },
      title: 'Privacy Policy',
    },
    commerce: {
      metadata: {
        title: 'Legal Notice Based on the Specified Commercial Transactions Act',
        description: 'Legal notice for subscription purchases on DiceSpec.',
      },
      title: 'Legal Notice Based on the Specified Commercial Transactions Act',
    },
  },
  profile: {
    title: 'Account',
    description: 'User profile page',
    'sign-in-prompt': 'Sign in to view profile',
    'display-name': {
      label: 'Display name',
      placeholder: 'Enter display name',
    },
    'google-sign-in': 'Sign in with Google',
    agreement: {
      prefix: 'By creating an account, you agree to the ',
      terms: 'Terms of Service',
      conjunction: ' and ',
      privacy: 'Privacy Policy',
      suffix: '.',
    },
    menu: {
      'aria-label': 'User menu',
      profile: 'Profile',
      'sign-out': 'Sign out',
    },
    email: {
      label: 'Email address',
      hint: "Email address can't be changed",
    },
    avatar: {
      'aria-label': 'Click to upload avatar',
    },
    button: {
      save: 'Save',
      saving: 'Saving...',
    },
    toast: {
      'save-success-title': 'Saved',
      'save-success-description': 'Display name updated',
      'save-error-title': 'An error occurred',
      'save-error-description': 'Failed to update display name',
      'avatar-upload-error-title': 'Failed to upload avatar',
      'avatar-upload-error-description': 'Please try again later.',
      'avatar-upload-error-unsupported-format-description': 'Unsupported image format. Please use JPEG, PNG, or WebP.',
      'avatar-upload-error-too-large-description':
        'The image is still larger than 1 MiB after optimization. Please choose another image.',
      'avatar-upload-error-invalid-image-description': 'Failed to decode image. Please try another file.',
      'sign-in-error-title': 'Sign-in failed',
      'sign-in-error-description': 'Failed to initialize your account. Please try again later.',
      'upgrade-error-title': 'Upgrade failed',
      'upgrade-error-description': 'Please try again',
      'manage-subscription-error-title': 'Failed to manage subscription',
      'manage-subscription-error-description': 'Please try again',
      'manage-subscription-error-no-customer': 'Subscription information was not found',
    },
    plan: {
      title: 'Plan Management',
      'current-plan': 'Current Plan',
      free: 'Free',
      pro: 'Pro',
      'manage-subscription': 'Manage subscription in Stripe',
      'manage-subscription-note':
        'You will be redirected to an external site (Stripe). Plan changes and cancellation are available there.',
      loading: 'Loading...',
    },
    pricing: {
      title: 'Upgrade for a better dice experience🎲',
      'billing-monthly': 'Monthly',
      'billing-yearly': 'Yearly',
      'plan-name': 'PRO',
      month: 'month',
      'monthly-payment': 'Monthly billing',
      'yearly-payment': '¥{{price}} billed yearly',
      'feature-unlimited-saves': 'Unlimited analysis saves',
      'feature-advanced-analytics': 'Advanced statistical analysis',
      'upgrade-button': 'Start PRO Plan',
      processing: 'Processing...',
      'legal-note-prefix': 'Before purchasing, please review the ',
      'legal-link-label': 'Legal Notice Based on the Specified Commercial Transactions Act',
      'legal-note-suffix': '.',
    },
  },
};
