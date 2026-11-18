import { Feedback } from '@nextrap/nte-feedback';

let pendingRequests = 0;

/** Keep the shared loading indicator open until all API requests have settled. */
export async function requestFeedback<T>(request: () => Promise<T>): Promise<T> {
  if (pendingRequests++ === 0) {
    void Feedback.loading({ message: 'Loading from Brace…' });
  }
  try {
    return await request();
  } finally {
    if (--pendingRequests === 0) {
      Feedback.close();
    }
  }
}
