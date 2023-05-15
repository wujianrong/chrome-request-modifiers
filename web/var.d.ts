declare interface ApiItem {
  id?: string;
  filterType: 'normal' | 'regex' | 'exact';
  name: string;
  api: string;
  status: boolean;
  httpStatus: boolean;
  response: any;
}

declare interface ChromeMessage {
  key: string;
  value: any;
}