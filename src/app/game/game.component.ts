import { Component } from '@angular/core';
// import { CookieService } from 'ngx-cookie-service';

interface ConnectionItem {
  id: number,
  title: string,
  tn: string,
  cat_id: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  // Cokies were commented out until functionality is fixed.
// constructor(public cookieGuy: CookieService) { }

  Math = Math;
  date = new Date(Date.now());

  doneRows: ConnectionItem[][] = [];
  rows: ConnectionItem[][] = [[], [], [], []];
  activeItems: ConnectionItem[] = [];
  itemsData: any = {};
  todayData: any = {};
  answers: string[][] = [];
  wikiIconPosition: { x: number, y: number } = { x: 0, y: 0 };

  isOneAway: boolean = false;
  isCopied: boolean = false;
  beaten: boolean = false;
  thumbnailsEnabled: boolean = false;
  wikiModeEnabled: boolean = false;
  dropDownsOpened: boolean[] = [false, false, false, false];
  doneRowColors: { emoji: string, color: string }[] = [{ emoji: '🟧', color: '#ffbc21' }, { emoji: '🟩', color: '#cbff70' }, { emoji: '🟦', color: '#78daf9' }, { emoji: '🟪', color: '#faa3ff' }];

  lives: number = 4;
  playlistHref: string = '';
  hovers: string = '';

  async ngOnInit() {
    // if (this.cookieGuy.get('beaten')) {
    //   this.beaten = true;
    //   let leftCats: ConnectionItem[][] = [[], [], [], []];
    //   for (let row of this.rows) {
    //     for (let item of row) {
    //       leftCats[item.cat_id].push(item);
    //     }
    //   }

    //   for (let leftCat of leftCats) {
    //     if (leftCat.length >= 4) {
    //       this.doneRows.push(leftCat);
    //       this.activeItems = [];
    //     }
    //   }

    //   this.rows = [];
    // } else {
    //   this.beaten = false;
    // }

    var response = await fetch('https://raw.githubusercontent.com/MJ-014/Rip-connections/main/docs/items.json', { method: 'GET' });
    this.itemsData = await response.json();
    console.log(this.itemsData)
    this.todayData = this.itemsData[this.date.getUTCDate() + '/' + this.date.getUTCMonth() + '/' + this.date.getUTCFullYear() as keyof typeof this.itemsData];

    for (let item of this.todayData.items) {
      this.rows[~~((item.id) / 4)]?.push(item);
    }

    this.playlist()

    this.shuffle()
  }

  onItemClicked(id: number): void {
    if (this.wikiModeEnabled) {
      this.hovers = this.getItemById(id).title;
      this.onItemRightClick();
    } else {
      if (this.isActive(id)) {
        // If the item is already selected: deselects it.
        this.activeItems.splice(this.activeItems.indexOf(this.getItemById(id)), 1);
      } else {
        // If the item has not been selected: selects it.
        if (!(this.activeItems.length > 3)) {
          this.activeItems.push(this.getItemById(id));
        }
      }
    }
  }

  share() {
    let copyText: string = "";
    copyText += `Rip Connection ${String(this.date.getUTCDate() + '/' + (this.date.getUTCMonth() + 1) + '/' + this.date.getUTCFullYear() as keyof typeof this.itemsData)} \n`;
    for (let answer of this.answers) {
      copyText += '\n' + answer.join('');
    }
    copyText += "\n\nhttps://mj-014.github.io/Rip-connections/"
    navigator.clipboard.writeText(copyText);
    this.isCopied = true;
    setTimeout(() => { this.isCopied = false; }, 2000)
  }

  submit(): void {
    let removedItems: ConnectionItem[] = []
    if (this.catagoriesAreCorrect() && this.activeItems.length > 3) {
      this.saveAnswers();
      // If the selection was right
      for (let row of this.rows) {
        let i = row.length;
        while (i--) {
          if (this.isActive(row[i].id)) {
            removedItems.push(row.splice(row.indexOf(row[i]), 1)[0]);
          }
        }
      }


      this.doneRows.push(removedItems);

      if (this.doneRows.length >= 4) {
        this.beaten = true;
        // this.cookieGuy.set('beaten', 'true');
      }

      this.activeItems = [];
      this.shuffle(4);
      this.deselect();
    } else if (this.activeItems.length > 3) {
      // If the selection was wrong
      this.saveAnswers();
      this.lives--;
      if (this.lives <= 0) {
        this.beaten = true;
        // this.cookieGuy.set('beaten', 'true');
        let leftCats: ConnectionItem[][] = [[], [], [], []];
        for (let row of this.rows) {
          for (let item of row) {
            leftCats[item.cat_id].push(item);
          }
        }

        for (let leftCat of leftCats) {
          if (leftCat.length >= 4) {
            this.doneRows.push(leftCat);
            this.activeItems = [];
          }
        }

        this.rows = [];
      }
    }
  }

  saveAnswers() {
    let answerToPush: string[] = []
    for (let activeItem of this.activeItems) {
      answerToPush.push(this.doneRowColors[activeItem.cat_id].emoji);
    }
    this.answers.push(answerToPush);
    console.log(this.answers)
  }

  getCatTitle(cat_id: number): string {
    for (let cat of this.todayData.groups) {
      if (cat_id == cat.id) {
        return cat.title;
      }
    }
    return "ERROR"
  }

  deselect() {
    this.activeItems = [];
  }

  onItemRightClick() {
    window.open("https://siivagunner.fandom.com/wiki/" + encodeURIComponent(this.hovers).replace("#", ""), '_blank');
    return false;
  }

  playlist() {
    this.playlistHref = 'https://youtube.com/watch_videos?video_ids=';
    let temp: any = this.shuffleLink(this.todayData.items);
    for (let item of temp) {
      this.playlistHref += `${item.tn},`
    }
  }

  getItemById(id: number) {
    for (let row of this.rows) {
      for (let item of row) {
        if (item.id == id) {
          return item;
        }
      }
    }
    return { id: -1, title: "", tn: "", cat_id: -1 };
  }

  isActive(id: number): boolean {
    for (let row of this.rows) {
      for (let item of row) {
        if (this.activeItems.includes(item) && item.id == id) {
          return true;
        }
      }
    }
    return false;
  }

  catagoriesAreCorrect(): boolean {
    this.isOneAway = false;
    const onesRight: number[] = [0, 0, 0, 0]

    for (let selectedItem of this.activeItems) {
      onesRight[selectedItem.cat_id]++
    }

    if (this.Math.max(...onesRight) == 3) {
      this.isOneAway = true;
      setTimeout(() => { this.isOneAway = false; }, 2000)
    } else if (this.Math.max(...onesRight) == 4) {
      return true;
    }
    return false;
  }

  shuffleLink(array: any): any {
    let currentIndex = array.length;
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  shuffle(x: number = 4): void {
    let flattened: ConnectionItem[] = []
    for (let row of this.rows) {
      flattened = flattened.concat(row);
    }

    let currentIndex = flattened.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [flattened[currentIndex], flattened[randomIndex]] = [
        flattened[randomIndex], flattened[currentIndex]];
    }

    const result: ConnectionItem[][] = [];

    for (let i = 0; i < flattened.length; i += x) {
      const chunk = flattened.slice(i, i + x);
      result.push(chunk);
    }

    this.rows = result;
  }
}
