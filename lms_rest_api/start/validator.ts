import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Applicable for all fields
  'required': 'The {{ field }} is required',
  'minLength': 'The {{ field }} must have a least {{ min }} length.',
  'confirmed': 'The password is not matched with Confirm Password.',

  // Error message for the username field
  'database.unique': 'The username is already used.',
})
