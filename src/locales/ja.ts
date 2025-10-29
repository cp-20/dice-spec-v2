export const ja = {
  translation: {
    lang: 'ja',
    link: '{{- href}}',
  },
  'landing-page': {
    title: 'ダイススペック',
    description:
      'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。ダイス予測、ダイスロール、ログ解析といったツールが用意されており、それらを全て無料で使うことができます。',
    catchphrase: 'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。',
    'try-it-out': '今すぐ使ってみる！',
    features: {
      label: 'ダイススペックの機能',
    },
    characteristics: {
      label: 'ダイススペックの特長',
      0: {
        label: '完全無料',
        contents: 'ダイススペックの利用に料金は一切かかりません。',
      },
      1: {
        label: '軽快な動作',
        contents: 'ダイススペックはパフォーマンスを意識した設計になっており、処理を待つ時間はほとんどありません。',
      },
      2: {
        label: 'オープンソース',
        contents:
          'ダイススペックは全てオープンソースで開発されており、誰でも自由に閲覧・修正提案を行うことができます。なのでユーザーも安心して使うことができます',
      },
    },
    credit: 'クレジット',
    'privacy-policy': {
      label: 'プライバシーポリシー',
      description:
        '当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。このGoogleアナリティクスはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細はGoogleアナリティクスサービス利用規約のページやGoogleポリシーと規約ページをご覧ください。',
    },
  },
  expect: {
    usage1:
      '`1d6`や`1D100`といったダイスの期待値を計算することで、ダイスを振るときにどういう結果が出るのかを予測できます。',
    usage2: 'さらに`1d100<=10`や`2D6>=10`と入力することで、その確率も知ることができます。',
    input: {
      placeholder: '計算式を入力してください',
      calculation: '計算',
      'calculation-error': '計算に失敗しました。計算式を確認してください。',
      'auto-recalculation-option': '変更時に自動で再計算',
    },
    stats: {
      chance: '確率',
      mean: '平均値',
      ci: '信頼区間 (P95)',
      sd: '標準偏差',
      variance: '分散',
      range: '範囲',
    },
  },
  dice: {
    usage:
      'シンプルモードでは基本的なダイスを、アドバンスドモードでは様々なゲームシステムのダイスを振ることができます。',
    simple: {
      label: 'シンプル',
      output: 'ここに結果が表示されます',
      'reset-dice': 'リセット',
      'roll-dice': 'ダイスロール',
      increment: '{{dice}}を増やす',
      decrement: '{{dice}}を減らす',
    },
    advanced: {
      label: 'アドバンスド',
      'game-system': {
        label: 'ゲームシステム',
        button: 'ゲームシステムを選択',
        search: 'ゲームシステムを検索',
        'no-result': '該当するゲームシステムが見つかりませんでした。',
      },
      output: '出力',
      'quick-input': {
        'add-favorite': '{{command}}をお気に入りに登録',
        'remove-favorite': '{{command}}をお気に入りから削除',
        'migration-announcement':
          '<l>旧アプリ</l>からの移行に際して履歴・お気に入りは引き継がれていません。必要であれば<l>旧アプリ</l>を参考に再登録をお願いします。',
      },
      input: {
        'error-failed': 'ロールに失敗しました。コマンドを見直してみてください',
        'error-invalid': 'コマンドの形式が不正です',
        placeholder: 'コマンドを入力してください',
        'roll-dice': 'ダイスを振る',
      },
      error: 'ダイスロールに失敗しました',
      'dicebot-usage': '「{{systemName}}」の使い方',
      'advanced-settings': {
        label: '高度な設定',
        'show-help': 'ヘルプを表示する',
        'enable-sound': 'サウンドを再生する',
        volume: '音量',
        'bcdice-server': 'BCDiceサーバー',
        'migration-announcement':
          '<l>旧アプリ</l>からの移行に際して設定は引き継がれていません。必要であれば<l>旧アプリ</l>を参考に再設定をお願いします。',
      },
    },
  },
  'analyze-logs': {
    usage1: 'ココフォリアのログを解析してダイスの期待値などを計算します。',
    'game-system-request': {
      label: '他ゲームシステム対応をリクエスト',
      system: 'ゲームシステム名',
      logs: 'ログファイル (任意)',
      'logs-description': 'ログファイルがあると対応がしやすくなります！',
      submit: '送信',
      submitted: 'リクエストを送信しました！',
      'submitted-description': 'リクエストありがとうございます！',
      error: 'リクエストの送信に失敗しました',
      'already-implemented': 'このゲームシステムは今すぐ使えます',
    },
    upload: {
      button: 'クリックしてアップロード、あるいはドラッグアンドドロップしてアップロード',
      'button-mouseover': '離してアップロード',
      'current-file': '現在選択されているファイル',
    },
    'game-system-select': {
      label: 'ゲームシステムを選択',
    },
    'character-select': {
      label: 'キャラを選択',
    },
    stats: {
      mean: '平均',
      deviation: 'ダイス偏差値',
      'success-rate': '成功率',
      'roll-count': 'ダイスを振った回数',
      'roll-count-unit': '回',
      'dice-count-unit': '個',
      share: '解析結果をシェア',
    },
    log: 'ダイスログ',
  },
  ccfolia: {
    usage:
      'キャラの各項目を記入すると、ココフォリアに出力できる形式にフォーマットしてくれるツールです。逆にココフォリア出力形式から読み込むこともできるので、「ここの値を少しだけ変えたい！」といった場合に便利です。',
    'load-clipboard': {
      button: 'クリップボードから読み込む',
      error: 'クリップボードから読み込みに失敗しました',
      'error-description': '形式が正しくないか、クリップボードからの読み込みが許可されていません',
    },
    input: {
      name: {
        label: '名前',
        placeholder: 'キャラクター名',
      },
      memo: {
        label: 'メモ',
        placeholder: 'メモ',
      },
      initiative: {
        label: 'イニシアティブ',
        placeholder: 'イニシアティブ',
        description: 'キャラの行動力を示す値です。キャラの表示順序に影響します。',
      },
      'external-url': {
        label: '参照URL',
        placeholder: 'https://example.com/some_character',
        description: 'キャラの参照先のURLです。通常はキャラシのURLが入ります。',
      },
      status: {
        label: 'ステータス',
        description:
          'HPやMPなど、キャラに連動して変動するステータスを設定します。{ラベル名} のように発言するとチャットから現在値を参照することができます。',
        'status-label': 'ラベル',
        'status-value': '現在値',
        'status-max': '最大値',
        add: '新しいステータスを追加',
      },
      params: {
        label: 'パラメータ',
        description:
          'キャラの能力値など、めったに変動しないパラメータを設定します。{ラベル名} のように発言するとチャットから値を参照することができます。',
        'param-label': 'ラベル',
        'param-value': '値',
        add: '新しいパラメータを追加',
      },
      color: {
        label: 'チャットカラー',
        character: 'キャラ1',
        time: '今日 13:04',
        message: 'これはテストメッセージです。キャラの名前に色が反映されます。',
      },
      commands: {
        label: 'チャットパレット',
        placeholder: 'CC<=70 【目星】',
        description:
          'キャラを選択したときにチャットから素早く入力できるコマンドです。{攻撃力} のようにすることでステータス・パラメータの値を参照できます。',
      },
    },
    result: '出力結果',
    'copy-to-clipboard': 'クリップボードにコピー',
  },
  common: {
    announcement: {
      label: 'お知らせ',
      migration:
        'ダイススペックは <target>{{target}}</target> に移行しました。既存の機能は引き続き問題なくご利用いただけます。',
      oldAppMigration:
        'お使いのアプリは古いバージョンです。最新のダイススペックは <target>{{target}}</target> に移行しました。',
      close: 'お知らせを閉じる',
    },
    header: {
      'app-name': 'ダイススペック',
      'feedback-button': 'フィードバック',
      feedback: {
        title: 'フィードバック',
        description:
          '「ここをこういう風に改善して欲しい！」「なんかバグった」「この機能が欲しい！」といったフィードバックをお寄せください (なるべく具体的に書いてもらえると嬉しいです！)',
        name: '名前 (任意)',
        feedback: 'フィードバック',
        submit: '送信',
        submitted: 'フィードバックを送信しました！',
        'submitted-description': 'フィードバックを送信していただきありがとうございます！',
        error: 'フィードバックの送信に失敗しました',
      },
    },
    expect: {
      title: 'ダイス予測',
      description: 'ダイスの期待値などを計算します。ダイスを振るときに、どういう結果が出るのかを予測できます。',
    },
    dice: {
      title: 'ダイスロール',
      description:
        '1D6、2D6、3D6、1D100、2D10、2D3 といったダイスはもちろん、どんな複雑なダイスでも振ることができます！クトルゥフ神話TRPGやシノビガミといったゲームシステム特有のダイスにも対応しています！',
    },
    'analyze-logs': {
      title: 'ログ解析',
      description:
        'ココフォリアのログを分析してダイスの平均値や偏差値を計算します。「このセッションはダイス運悪かった気がするけど実際どうなんだろう？」と思っているあなた、ぜひ一度使ってみてください！　クトゥルフ神話TRPG、新クトゥルフTRPG、エモクロア、シノビガミに対応しています。',
    },
    ccfolia: { title: 'ココフォリア出力' },
    error: {
      message: '予期せぬエラーが発生しました',
      reload: '再読み込み',
    },
  },
};
