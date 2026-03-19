#include <stdio.h>
#include <string.h>
#include "pico/stdlib.h"
#include "monocypher.h"

// 1. THE HOTWIRE: Direct address for hardware noise
#define ROSC_RANDOMBIT_ADDR ((volatile uint32_t *)(0x40060000 + 0x1c))

// 2. The Updated "Vault Box" 
struct SecretEntry {
    char service[32];
    char username[32];
    uint8_t nonce[8];              
    uint8_t encrypted_password[64]; 
};

// 3. The Master Key
static const uint8_t MASTER_KEY[32] = { 
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0x20, 0x21, 0x22, 0x23, 0x24,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x30, 0x31, 0x32 
};

// 4. Random Noise Generator
void generate_random_nonce(uint8_t *nonce, size_t len) {
    for (size_t i = 0; i < len; i++) {
        uint8_t byte = 0;
        for (int bit = 0; bit < 8; bit++) {
            byte = (byte << 1) | (*ROSC_RANDOMBIT_ADDR & 1);
        }
        nonce[i] = byte;
    }
}

// 5. The Unscrambler (Decryption)
void decrypt_secret(const SecretEntry* entry, char* out_plain_pass) {
    crypto_chacha20_djb(
        (uint8_t*)out_plain_pass, 
        entry->encrypted_password, 
        64, 
        MASTER_KEY, 
        entry->nonce, 
        0
    );
}

int main() {
    // Safety delay
    sleep_ms(3000);
    stdio_init_all();

    const uint LED_PIN = 25; 
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);

    printf("--- SYSTEM WAKING UP ---\n");

    // A. Create the Secret in RAM
    SecretEntry vault_test;
    memset(&vault_test, 0, sizeof(vault_test));
    strncpy(vault_test.service, "Instagram", 31);
    char plain_pass[] = "Pass123";

    // B. Generate Nonce and Encrypt
    generate_random_nonce(vault_test.nonce, 8);
    crypto_chacha20_djb(vault_test.encrypted_password, (const uint8_t*)plain_pass, strlen(plain_pass), MASTER_KEY, vault_test.nonce, 0);

    // C. (WE ARE SKIPPING FLASH WRITING FOR NOW TO AVOID CRASHES)
    printf("Encryption complete in RAM...\n");

    while (true) {
        gpio_put(LED_PIN, 1);
        
        // D. Decrypt from RAM
        char decrypted_pass[64] = {0};
        decrypt_secret(&vault_test, decrypted_pass);

        // E. Display results
        printf("\r\n--- FORTRESS KEY: PHASE 2 (RAM TEST) ---\r\n");
        printf("Service:   %s\r\n", vault_test.service);
        
        printf("Nonce:     ");
        for(int i=0; i<8; i++) printf("%02x ", vault_test.nonce[i]);
        
        printf("\r\nEncrypted: ");
        for(int i=0; i<8; i++) printf("%02x ", vault_test.encrypted_password[i]);

        printf("\r\nDECRYPTED: %s\r\n", decrypted_pass);
        printf("----------------------------------------\r\n");

        sleep_ms(500);
        gpio_put(LED_PIN, 0);
        sleep_ms(2500);
    }
}