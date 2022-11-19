export class VideoCards {
  public static count: number = 0;
  private _cards: string[] = ['RTX 3070', 'RTX 3060', 'RTX 3080'];

  constructor() {
    console.log('CREATE PROVIDER');
    VideoCards.count += 1;
  }

  get cards(): string[] {
    return this._cards;
  }
}
