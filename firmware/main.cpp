#include <stdio.h>
#include <string.h>
#include "pico/stdlib.h"
#include "hardware/flash.h"
#include "hardware/sync.h"
#include "monocypher.h" // The new Locksmith tool

#define FLASH_TARGET_OFFSET (2 * 1024 * 1024)
const uint LED_PIN = PICO_DEFAULT_LED_PIN;

// We updated the Box to hold "Encrypted" data
struct SecretEntry {
    char service[32];
    char username[32];
    uint8_t encrypted_password[64]; // Scrambled bits live here
};

// This is our Master Key (In Phase 3, we will make this even more secure)
static const uint8_t MASTER_KEY[32] = { 
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0x20, 0x21, 0x22, 0x23, 0x24,
    0x25, 0x26, 0x27, 0x28, 0x29, 0x30, 0x31, 0x32 
};

void save_secret_encrypted(const char* service, const char* user, const char* pass) {
    SecretEntry entry;
    memset(&entry, 0, sizeof(entry));
    
    strncpy(entry.service, service, 31);
    strncpy(entry.username, user, 31);

    // 1. Change this to 8 bytes (the DJB version needs exactly 8)
    uint8_t nonce[8] = {0}; 

    // 2. Add the '0' at the end (this is the 6th ingredient)
    crypto_chacha20_djb(
        entry.encrypted_password, 
        (const uint8_t*)pass, 
        strlen(pass), 
        MASTER_KEY, 
        nonce, 
        0
    );

    // Save the scrambled box to the Flash
    uint8_t buffer[FLASH_PAGE_SIZE];
    memset(buffer, 0, FLASH_PAGE_SIZE);
    memcpy(buffer, &entry, sizeof(entry));

    uint32_t ints = save_and_disable_interrupts();
    flash_range_erase(FLASH_TARGET_OFFSET, FLASH_SECTOR_SIZE);
    flash_range_program(FLASH_TARGET_OFFSET, buffer, FLASH_PAGE_SIZE);
    restore_interrupts(ints);
}
int main() {
    gpio_init(LED_PIN);
    gpio_set_dir(LED_PIN, GPIO_OUT);
    stdio_init_all();
    
    // 1. Scramble and Save "Instagram"
    save_secret_encrypted("Instagram", "ShrikeUser", "Pass123");

    while (1) {
        const SecretEntry* saved = (const SecretEntry*)(XIP_BASE + FLASH_TARGET_OFFSET);
        
        gpio_put(LED_PIN, 1);
        printf("\r\n--- Fortress Vault Phase 2 ---\r\n");
        printf("Service: %s\r\n", saved->service);
        
        // This will print "Gibberish" because it is encrypted!
        printf("Encrypted Pass: ");
        for(int i=0; i<16; i++) printf("%02x", saved->encrypted_password[i]);
        printf("\r\n---------------------------\r\n");
        
        sleep_ms(500);
        gpio_put(LED_PIN, 0);
        sleep_ms(1500); 
    }
}