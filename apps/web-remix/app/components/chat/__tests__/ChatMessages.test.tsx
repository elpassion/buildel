import { describe, expect } from 'vitest';

import { ChatMessages, getDomainName } from '~/components/chat/ChatMessages';

describe(ChatMessages.name, () => {
  describe(getDomainName.name, () => {
    it('should return domain name when regional domain', () => {
      expect(getDomainName(new URL('https://www.bbc.co.uk'))).toBe('bbc');
    });

    it('should return domain name when basic domain', () => {
      expect(getDomainName(new URL('https://www.bbc.com'))).toBe('bbc');
    });

    it('should return domain name when path domain', () => {
      expect(getDomainName(new URL('https://www.bbc.co.uk/news'))).toBe('bbc');
    });

    it('should return domain name when subdomain', () => {
      expect(getDomainName(new URL('https://subdomain.bbc.co.uk/news'))).toBe(
        'bbc',
      );
    });
  });
});
