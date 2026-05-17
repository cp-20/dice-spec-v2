export const ja = {
  translation: {
    lang: 'ja',
    'date-locale': 'ja-JP',
    link: '{{- href}}',
  },
  'landing-page': {
    description:
      'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。ダイス予測、ダイスロール、ログ解析といった豊富なツールが用意されており、それらの機能を基本無料でお使いいただけます。',
    catchphrase: 'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。',
    'try-it-out': '今すぐ使ってみる！',
    features: {
      label: 'ダイススペックの機能',
    },
    characteristics: {
      label: 'ダイススペックの特長',
      0: {
        label: '高度な機能',
        contents: '難しい計算や複雑な集計も、ダイススペックなら簡単にできます！',
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
    list: {
      'sign-in-required': 'この機能を利用するにはログインが必要です',
      'tab-mine': '自分の解析結果',
      'tab-public': '公開されている解析結果',
      filters: {
        'system-placeholder': 'ゲームシステム',
        'character-placeholder': 'キャラクター',
        'sort-placeholder': '並び替え',
        'all-systems': 'すべてのシステム',
      },
      sort: {
        newest: '新しい順',
        oldest: '古い順',
        deviationScoreDesc: '偏差値が高い順',
        deviationScoreAsc: '偏差値が低い順',
      },
      state: {
        loading: '読み込み中...',
        'no-results': '検索結果が見つかりませんでした',
        empty: '解析結果がありません',
      },
      'load-more': 'もっと見る',
      card: {
        'deviation-score': 'ダイス偏差値',
      },
    },
    save: {
      title: '保存と公開',
      'sign-in-required': '保存するにはログインが必要です',
      'title-label': 'タイトル',
      'title-placeholder': 'シナリオ名など',
      'session-date-label': 'セッション日',
      visibility: {
        label: '公開範囲',
        private: '非公開',
        unlisted: '限定公開',
        public: '公開',
      },
      'show-record-details-label': 'ダイスログを公開する',
      'limit-free': 'フリープランでは最大{{limit}}件まで保存できます (現在{{count}}件保存中)',
      'limit-reached-message': '保存件数の上限に達しました',
      'upgrade-to-pro': 'プロプランにアップグレードすると無制限に保存できるようになります',
      'upgrade-button': 'プロプランにアップグレード',
      'save-button': '保存する',
      saving: '保存中',
      failed: {
        title: '保存に失敗しました',
        description: '保存中にエラーが発生しました。時間をおいて再度お試しください。',
      },
      'go-to-list': '保存した解析結果の一覧を見る',
    },
    detail: {
      title: 'ログ解析結果',
      'not-found': 'この解析は見つかりませんでした',
      'not-found-description': '指定された解析が存在しないか、削除された可能性があります',
      'back-to-list': '解析一覧に戻る',
      edit: '編集',
      delete: '削除',
      private: 'この解析は非公開です',
      'records-owner-only': '非公開になっています',
      'no-logs': 'ログは保存されていません',
    },
    'edit-dialog': {
      title: '解析結果を編集',
      description: 'タイトルと公開設定を変更できます',
      'title-label': 'タイトル',
      'title-placeholder': 'タイトルを入力',
      'visibility-label': '公開設定',
      visibility: {
        private: '非公開 (自分のみ)',
        unlisted: '限定公開 (リンクを知っている人のみ)',
        public: '公開 (一覧に表示)',
      },
      'session-date-label': 'セッション日',
      'show-record-details-label': 'ダイスログを公開する',
      cancel: 'キャンセル',
      save: '保存',
      saving: '保存中',
    },
    'delete-dialog': {
      title: '解析結果を削除',
      description: 'この操作は取り消せません。本当に削除しますか？',
      cancel: 'キャンセル',
      delete: '削除',
      deleting: '削除中',
    },
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
      'add-button': 'ログを追加',
      'clear-button': '選択したログを削除',
      'button-mouseover': '離してアップロード',
      'current-file': '現在選択されているファイル',
    },
    'game-system-select': {
      label: 'ゲームシステムを選択',
    },
    'character-select': {
      label: 'キャラを選択',
    },
    error:
      '解析中にエラーが発生しました。正しいログファイルをアップロードしているか、正しいシステムが選択されているかを確認してください。',
    stats: {
      mean: '平均',
      'success-rate': '成功率',
      'roll-count': 'ダイスを振った回数',
      'roll-count-unit': '回',
      'dice-count-unit': '個',
      share: '解析結果をシェア',
    },
    'skill-summary': {
      label: '技能サマリー',
      skill: '技能',
      target: '技能値',
      'roll-count': '振った数',
      'success-count': '成功した数',
      'success-rate': '成功率',
      'no-data': 'サマリー可能な技能ロールがありません',
      untagged: '不明な技能',
      paywall: {
        title: '技能サマリーの詳細はプロプラン限定です',
        cta: 'PROプランをはじめる',
      },
    },
    'share-analysis-result': {
      title: '解析結果をシェア',
      'scenario-name': 'シナリオ名 (任意)',
      'scenario-name-description': '画像のタイトル部分に表示されます',
      'scenario-name-default': 'ログ解析結果',
      'share-image': '解析結果をシェア',
      'image-alt': '解析結果シェア画像のプレビュー',
      'share-text':
        '▼あなたのダイス結果を分析した結果▼\n\n平均: {{average}}\nダイス偏差値: {{deviationScore}}\n成功率: {{successRate}}\nダイスを振った回数: {{diceRollCount}}回\n\n#ダイススペック\n',
      'share-image-failed': '画像のシェアに失敗しました',
      'share-image-failed-description': '画像の生成またはアップロードに失敗しました。時間をおいて再度お試しください。',
    },
    chart: {
      top: '上位',
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
    'analysis-list': {
      title: '解析一覧',
      description: '自分が保存したログや他の人が公開しているログを確認できます。',
    },
    'blog-callout': {
      title: '「TRPGプレイヤーのための確率統計」好評連載中！',
      points: {
        0: '確率・統計をTRPGプレイヤー向けに全6回でふわっと解説！',
        1: '読みやすさ第一で書かれてるからサクッと読めちゃう！',
        2: 'なのに今日から役立つ知識がたくさん手に入るかも！',
      },
    },
    ccfolia: { title: 'ココフォリア出力' },
    error: {
      message: '予期せぬエラーが発生しました',
      reload: '再読み込み',
    },
  },
  legal: {
    'back-to-top': 'トップページに戻る',
    terms: {
      metadata: {
        title: '利用規約',
        description: 'ダイススペックを利用するための利用規約です。',
      },
      title: '利用規約',
    },
    privacy: {
      metadata: {
        title: 'プライバシーポリシー',
        description: 'DiceSpecにおける個人情報の取扱いに関するポリシーです。',
      },
      title: 'プライバシーポリシー',
    },
    commerce: {
      metadata: {
        title: '特定商取引法に基づく表記',
        description: 'DiceSpecの課金に関する特定商取引法に基づく表記です。',
      },
      title: '特定商取引法に基づく表記',
    },
  },
  profile: {
    title: 'アカウント情報',
    description: 'ユーザープロフィールページ',
    'sign-in-prompt': 'ログインしてプロフィールを表示してください',
    'display-name': {
      label: '表示名',
      placeholder: '表示名を入力',
    },
    'google-sign-in': 'Google でログイン',
    agreement: {
      prefix: 'アカウントを作成すると、',
      terms: '利用規約',
      conjunction: 'および',
      privacy: 'プライバシーポリシー',
      suffix: 'に同意したものとみなされます。',
    },
    menu: {
      'aria-label': 'ユーザーメニュー',
      profile: 'プロフィール',
      'sign-out': 'ログアウト',
    },
    email: {
      label: 'メールアドレス',
      hint: 'メールアドレスは変更できません',
    },
    avatar: {
      'aria-label': 'クリックしてアイコンをアップロード',
    },
    button: {
      save: '保存する',
      saving: '保存中',
    },
    toast: {
      'save-success-title': '保存しました',
      'save-success-description': '表示名が更新されました',
      'save-error-title': 'エラーが発生しました',
      'save-error-description': '表示名の更新に失敗しました',
      'avatar-upload-error-title': 'アバターのアップロードに失敗しました',
      'avatar-upload-error-description': '時間をおいて再度お試しください。',
      'avatar-upload-error-unsupported-format-description':
        '対応していない画像形式です。JPEG / PNG / WebP の画像を選択してください。',
      'avatar-upload-error-too-large-description': '画像の最適化後も 1MiB を超えています。別の画像を選択してください。',
      'avatar-upload-error-invalid-image-description': '画像の読み込みに失敗しました。別の画像をお試しください。',
      'sign-in-error-title': 'ログインに失敗しました',
      'sign-in-error-description': 'アカウントの初期化に失敗しました。時間をおいて再度お試しください。',
      'upgrade-error-title': 'アップグレードに失敗しました',
      'upgrade-error-description': 'もう一度お試しください',
      'manage-subscription-error-title': 'サブスクリプション管理に失敗しました',
      'manage-subscription-error-description': 'もう一度お試しください',
      'manage-subscription-error-no-customer': '契約情報が見つかりませんでした',
    },
    plan: {
      title: 'プラン管理',
      'current-plan': '現在のプラン',
      free: 'フリー',
      pro: 'プロ',
      'manage-subscription': 'Stripeでサブスクリプションを管理する',
      'manage-subscription-note': '外部サイト (Stripe) へ移動します。プラン変更や解約は遷移先で行えます。',
      loading: '読み込み中',
    },
    pricing: {
      title: 'アップグレードでより便利に',
      'billing-monthly': '月ごと',
      'billing-yearly': '年ごと',
      'plan-name': 'PRO',
      month: '月',
      'monthly-payment': '月払い',
      'yearly-payment': '¥{{price}} 年払い',
      'feature-unlimited-saves': '解析結果を無制限に保存',
      'feature-advanced-analytics': '高度な統計分析',
      'upgrade-button': 'PROプランをはじめる',
      processing: '処理中',
      'legal-note-prefix': '課金前に',
      'legal-link-label': '特定商取引法に基づく表記',
      'legal-note-suffix': 'をご確認ください。',
    },
  },
};
