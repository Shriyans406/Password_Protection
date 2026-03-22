#include <stdio.h>
#include <string.h>
#include "pico/stdlib.h"
#include "monocypher.h"

#define ROSC_RANDOMBIT_ADDR ((volatile uint32_t *)(0x40060000 + 0x1c))

struct SecretEntry {
    char service[32];
    char username[32];
    uint8_t nonce[8];              
    uint8_t encrypted_password[64]; 
};

static const uint8_t MASTER_KEY[32] = { 
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0x20, 0x21, 0x22, 0x23, 0x24,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x30, 0x31, 0x32 
};

void generate_random_nonce(uint8_t *nonce, size_t len) {
    for (size_t i = 0; i < len; i++) {
        uint8_t byte = 0;
        for (int bit = 0; bit < 8; bit++) {
            byte = (byte << 1) | (*ROSC_RANDOMBIT_ADDR & 1);
        }
        nonce[i] = byte;
    }
}

void decrypt_secret(const SecretEntry* entry, char* out_plain_pass) {
    crypto_chacha20_djb(
        (uint8_t*)out_plain_pass, 
        entry->encrypted_password, 
        7, // Exactly 7 for Pass123
        MASTER_KEY, 
        entry->nonce, 
        0
    );
    out_plain_pass[7] = '\0'; // The stop-sign
}

int main() {
    sleep_ms(3000);
    stdio_init_all();

    const uint LED_PIN = 25; 
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);

    const uint TRIGGER_PIN = 20; 
    gpio_init(TRIGGER_PIN);
    gpio_set_dir(TRIGGER_PIN, GPIO_IN);
    gpio_pull_up(TRIGGER_PIN);

    SecretEntry vault_test;
    memset(&vault_test, 0, sizeof(vault_test));
    strncpy(vault_test.service, "Instagram", 31);
    char plain_pass[] = "Pass123";

    generate_random_nonce(vault_test.nonce, 8);
    crypto_chacha20_djb(vault_test.encrypted_password, (const uint8_t*)plain_pass, 7, MASTER_KEY, vault_test.nonce, 0);

    while (true) {
        printf("\r\n--- FORTRESS KEY: PHASE 5 (STABLE) ---\r\n");
        printf("Service:   %s\r\n", vault_test.service);
        
        if (gpio_get(TRIGGER_PIN)) {
            gpio_put(LED_PIN, 0); 
            printf("DECRYPTED: [LOCKED] PRESS BUTTON#\r\n");
        } 
        else {
            gpio_put(LED_PIN, 1); 
            char decrypted_pass[64] = {0};
            decrypt_secret(&vault_test, decrypted_pass);
            printf("DECRYPTED: %s#\r\n", decrypted_pass);
            sleep_ms(1000); 
        }
        printf("----------------------------------------\r\n");
        sleep_ms(1000);
    }
}