export interface Message {
  timestamp: string;
  author: string;
  content: string;
  // Below are optional fields that messages fetched from server will have
  _id?: string;
  __v?: string;
}
