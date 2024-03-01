export const en = {
  translation: {
    lang: 'en',
    link: '/en{{- href}}',
  },
  'landing-page': {
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
        contents:
          'DiceSpec is designed with performance in mind, so there is hardly any waiting time for processing.',
      },
      2: {
        label: 'Open Source',
        contents:
          'DiceSpec is developed entirely as open source, so anyone can freely view and propose modifications. So users can use it with confidence.',
      },
    },
    links: {
      label: 'Related Links',
      discord: 'Support Community',
      twitter: "Developer's Twitter",
      github: 'GitHub Repo',
    },
    credit: 'Credit',
    'privacy-policy': {
      label: 'Privacy Policy',
      description:
        'This website uses Google Analytics, an access analysis tool provided by Google. This Google Analytics uses cookies to collect data. This data is collected anonymously and does not personally identify you. This feature can be disabled by disabling cookies, so please check your browser settings. For more information about this agreement, please see the Google Analytics Terms of Service page and the Google Policies and Terms page.',
    },
  },
  expect: {
    usage1:
      'By calculating the expected value of a die, such as `1d6` or `1d100`, you can predict what the result will be when you roll the die.',
    usage2:
      'In addition, by entering `1d100<=10` or `2d6>=10`, the probability can also be known.',
    input: {
      placeholder: 'Please enter a formula',
      calculation: 'Calculate',
      'calculation-error':
        'Calculation failed. Please check the calculation formula.',
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
  },
  dice: {
    simple: {
      label: 'Simple',
      output: 'The result will be displayed here',
      'reset-dice': 'Reset',
      'roll-dice': 'Roll Dice',
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
      input: {
        'error-failed': 'Roll failed. Please review the command',
        'error-invalid': 'The command format is invalid',
        placeholder: 'Enter a command',
        'roll-dice': 'Roll Dice',
      },
      'dicebot-usage': 'How to use "{{systemName}}"',
      'advanced-settings': {
        label: 'Advanced Settings',
        'show-help': 'Show Help',
        'enable-sound': 'Play Sound',
        volume: 'Volume',
        'bcdice-server': 'BCDice Server',
      },
    },
  },
  'analyze-logs': {
    usage1:
      'Analyze the logs of Cocoforia to calculate the expected value of the dice, etc.',
    usage2: '(Only supports Call of Cthulhu TRPG and New Call of Cthulhu TRPG)',
    upload: {
      button: 'Click to upload or drag and drop to upload',
      'button-mouseover': 'Release and upload',
      'current-file': 'Currently selected file',
    },
    'character-select': {
      label: 'Select a character',
    },
    stats: {
      mean: 'Mean',
      deviation: 'Dice Deviation Value',
      'success-rate': 'Success Rate',
      'roll-count': 'Number of dice rolled',
      'roll-count-unit': '',
      share: 'Share analysis results',
    },
    log: 'Dice Logs',
  },
  ccfolia: {
    usage:
      'This tool formats the character\'s items into a format that can be output to Cocoforia. It can also be used to read from Cocoforia output format, so it is useful when you want to "change a little bit of this value!"',
    'load-clipboard': {
      button: 'Load from clipboard',
      error: 'Failed to load from clipboard',
      'error-description':
        'Failed to load from clipboard. Please check the format of the copied text.',
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
        message:
          "This is a test message. The color is reflected in the character's name.",
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
    'update-announcement': {
      label: 'DiceSpec have been updated to v2.',
      v1: 'The original v1 can be accessed here.',
    },
    expect: {
      title: 'Dice Expecter',
      description:
        'Analyze Cocoforia\'s logs to calculate dice averages, etc. You may be thinking, "I feel like I had bad luck with dice this session, but what really happened?" If you are thinking, "I think I had bad luck with dice this session, but what really happened?',
    },
    dice: {
      title: 'Dice Roll',
      description:
        'You can roll any dice you like, and because it uses BCDice, it is as comfortable to use as session tools such as CCFOLIA.',
    },
    'analyze-logs': {
      title: 'Log Analyzer',
      description:
        'Calculate the expected value of the dice, etc. You can predict what kind of result you will get when you roll the dice.',
    },
    ccfolia: { title: 'CCFOLIA Export' },
  },
};
