import tbk
import os

class Setinggs_tbk():
	CERTIFICATES_DIR = os.path.join(os.path.dirname(__file__), 'commerces')

	#credenciales local
	HOST = os.getenv('HOST', 'http://127.0.0.1')
	PORT = os.getenv('PORT', '8083')

	BASE_URL = '{host}:{port}'.format(host=HOST, port=PORT)

	NORMAL_COMMERCE_CODE = ""


	def load_commerce_data(self, commerce_code):
	    with open(os.path.join(self.CERTIFICATES_DIR, commerce_code, commerce_code + '.key'), 'r') as file:
	        key_data = file.read()
	    with open(os.path.join(self.CERTIFICATES_DIR, commerce_code, commerce_code + '.crt'), 'r') as file:
	        cert_data = file.read()
	    # Certificado publico de prueba
	    with open(os.path.join(self.CERTIFICATES_DIR, 'tbk.pem'), 'r') as file:
	        tbk_cert_data = file.read()

	    return {
	        'key_data': key_data,
	        'cert_data': cert_data,
	        'tbk_cert_data': tbk_cert_data
	    }

	def init_tbk(self):
		self.NORMAL_COMMERCE_CODE = "597020000541"

		normal_commerce_data = self.load_commerce_data(self.NORMAL_COMMERCE_CODE)
		normal_commerce = tbk.commerce.Commerce(
		    commerce_code = self.NORMAL_COMMERCE_CODE,
		    key_data = normal_commerce_data['key_data'],
		    cert_data = normal_commerce_data['cert_data'],
		    tbk_cert_data = normal_commerce_data['tbk_cert_data'],
		    environment = tbk.environments.DEVELOPMENT)
			# environment = tbk.environments.PRODUCTION)

		return normal_commerce

	def get_base_url(self):
		return self.BASE_URL

