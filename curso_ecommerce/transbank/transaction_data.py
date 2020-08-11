class transaction_order:
	id_order = 0
	mount = 0
	token = ''
	authorizationCode = ''
	paymentTypeCode = ''
	cardNumber = ''

	def get_mount(self, token):
		if token == self.token:
			return self.mount
		else:
			return 'Token invalido'

	def get_id_order(self, token):
		if str(token) == self.token:
			return self.id_order

		else:
			return 'Token invalido'

	def get_token(self):
		return self.token

	def get_authorizationCode(self):
		return self.authorizationCode

	def get_paymentTypeCode(self):
		return self.paymentTypeCode

	def get_cardNumber(self):
		return self.cardNumber

	def set_cardNumber(self, Card):
		self.cardNumber = Card

	def set_authorizationCode(self, Code):
		self.authorizationCode = Code

	def set_paymentTypeCode(self, Type):
		self.paymentTypeCode = Type

	def set_mount(self, mount):
		self.mount = mount

	def set_id_order(self, id_order):
		self.id_order = id_order

	def set_token(self, token):
		self.token = token
