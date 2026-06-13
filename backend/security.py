from cryptography.fernet import Fernet
import os 

MASTER_KEY = os.environ.get("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher = Fernet(MASTER_KEY.encode())

def encrypt_token(token:str) -> str:
    return cipher.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token:str) -> str:
    return cipher.decrypt(encrypted_token.encode()).decode()

