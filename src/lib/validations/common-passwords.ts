const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "password1234", "passw0rd", "p@ssw0rd", "p@ssword",
  "12345678", "123456789", "1234567890", "123123123", "11111111", "00000000", "87654321", "12341234",
  "qwertyui", "qwerty123", "qwertyuiop", "qwerty12", "1q2w3e4r", "1q2w3e4r5t", "q1w2e3r4", "zxcvbnm1",
  "abcd1234", "abc12345", "abcdefgh", "letmein1", "letmein123", "welcome1", "welcome123", "iloveyou",
  "iloveyou1", "admin123", "admin1234", "administrator", "changeme", "changeme123", "default123",
  "monkey123", "dragon123", "football1", "baseball1", "superman1", "sunshine1", "princess1", "master123",
  "shadow123", "trustno1", "whatever1", "starwars1", "hello123", "hello1234", "freedom1", "test1234",
  "testtest", "guest1234", "login123", "pass1234", "passpass", "secret123", "internet1", "computer1",
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.trim().toLowerCase());
}