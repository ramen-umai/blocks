class zpdicApi {

    constructor() {
      this.apiKey = "";
      this.dictId = "";
      this.result = null;
    }
  
    getInfo() {
      return {
        id: "zpdicApi",
        name: "ZpDIC API",
        color1: "#FF8C00",
        color2: "#FF8C00",
        color3: "#FF4500",
        menuIconURI: "https://zpdic.ziphil.com/static/favicon.ico",
  
        blocks: [
  
          {
            opcode: "label1",
            blockType: Scratch.BlockType.LABEL,
            text: "セットアップ"
          },
  
          {
            opcode: "setApiKey",
            blockType: Scratch.BlockType.COMMAND,
            text: "APIキーを [KEY] にする",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING }
            }
          },
  
          {
            opcode: "setDictionary",
            blockType: Scratch.BlockType.COMMAND,
            text: "辞書IDを [ID] にする",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING }
            }
          },
  
          {
            opcode: "label2",
            blockType: Scratch.BlockType.LABEL,
            text: "検索"
          },
  
          {
            opcode: "searchWord",
            blockType: Scratch.BlockType.COMMAND,
            text: "単語 [TEXT] を検索する",
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING }
            }
          },
  
          {
            opcode: "resultCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "検索結果の数"
          },
  
          {
            opcode: "wordName",
            blockType: Scratch.BlockType.REPORTER,
            text: "[INDEX] 番目の単語",
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
  
          {
            opcode: "wordMeaning",
            blockType: Scratch.BlockType.REPORTER,
            text: "[INDEX] 番目の意味",
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
  
          {
            opcode: "wordContent",
            blockType: Scratch.BlockType.REPORTER,
            text: "[INDEX] 番目の内容",
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
  
          {
            opcode: "label3",
            blockType: Scratch.BlockType.LABEL,
            text: "単語追加"
          },
  
          {
            opcode: "addWord",
            blockType: Scratch.BlockType.COMMAND,
            text: "単語 [WORD] 意味 [MEANING] を追加",
            arguments: {
              WORD: { type: Scratch.ArgumentType.STRING },
              MEANING: { type: Scratch.ArgumentType.STRING }
            }
          },
  
          {
            opcode: "addFullWord",
            blockType: Scratch.BlockType.COMMAND,
            text: "単語 [WORD] 意味 [MEANING] 内容タイトル [TITLE] 内容 [CONTENT] タグ [TAGS] を追加",
            arguments: {
              WORD: { type: Scratch.ArgumentType.STRING },
              MEANING: { type: Scratch.ArgumentType.STRING },
              TITLE: { type: Scratch.ArgumentType.STRING },
              CONTENT: { type: Scratch.ArgumentType.STRING },
              TAGS: { type: Scratch.ArgumentType.STRING }
            }
          },
  
          {
            opcode: "rawResult",
            blockType: Scratch.BlockType.REPORTER,
            text: "生データ"
          }
  
        ]
      };
    }
  
    setApiKey(args) {
      this.apiKey = args.KEY;
    }
  
    setDictionary(args) {
      this.dictId = args.ID;
    }
  
    async searchWord(args) {
  
      if (!this.apiKey || !this.dictId) return;
  
      const url =
        `https://zpdic.ziphil.com/api/v0/dictionary/${this.dictId}/words?text=${encodeURIComponent(args.TEXT)}`;
  
      const res = await fetch(url, {
        headers: {
          "X-Api-Key": this.apiKey
        }
      });
  
      if (!res.ok) {
        this.result = null;
        return;
      }
  
      this.result = await res.json();
    }
  
    resultCount() {
  
      if (!this.result) return 0;
      if (!this.result.words) return 0;
  
      return this.result.words.length;
    }
  
    wordName(args) {
  
      const i = args.INDEX - 1;
  
      if (!this.result || !this.result.words || !this.result.words[i]) return "";
  
      return this.result.words[i].name || "";
    }
  
    wordMeaning(args) {
  
      const i = args.INDEX - 1;
  
      if (!this.result || !this.result.words || !this.result.words[i]) return "";
  
      const word = this.result.words[i];
  
      if (!word.equivalents || !word.equivalents[0]) return "";
  
      return word.equivalents[0].names.join(", ");
    }
  
    wordContent(args) {

        const i = args.INDEX - 1;
      
        if (!this.result) return "";
        if (!this.result.words) return "";
        if (!this.result.words[i]) return "";
      
        const word = this.result.words[i];
      
        if (!word.informations) return "";
      
        let text = "";
      
        for (const info of word.informations) {
      
          if (info.title) {
            text += info.title + ": ";
          }
      
          if (info.text) {
            text += info.text;
          }
      
          if (info.content) {
            text += info.content;
          }
      
          text += "\n";
        }
      
        return text.trim();
      }
  
    async addWord(args) {
  
      if (!this.apiKey || !this.dictId) return;
  
      const url =
        `https://zpdic.ziphil.com/api/v0/dictionary/${this.dictId}/word`;
  
      const body = {
        word: {
          name: args.WORD,
          equivalents: [
            {
              titles: [],
              names: [args.MEANING]
            }
          ]
        }
      };
  
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey
        },
        body: JSON.stringify(body)
      });
    }
  
    async addFullWord(args) {
  
      if (!this.apiKey || !this.dictId) return;
  
      const tags =
        args.TAGS
          ? args.TAGS.split(",").map(t => t.trim())
          : [];
  
      const url =
        `https://zpdic.ziphil.com/api/v0/dictionary/${this.dictId}/word`;
  
      const body = {
        word: {
          name: args.WORD,
  
          equivalents: [
            {
              titles: [],
              names: [args.MEANING]
            }
          ],
  
          informations: [
            {
              title: args.TITLE,
              content: args.CONTENT
            }
          ],
  
          tags: tags
        }
      };
  
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey
        },
        body: JSON.stringify(body)
      });
    }
  
    rawResult() {
  
      if (!this.result) return "";
  
      return JSON.stringify(this.result);
    }
  
  }
  
  Scratch.extensions.register(new zpdicApi());