#include <iostream>
#include "pico/stdlib.h"
#include "hardware/flash.h"
#include "hardware/sync.h"

// We will store data at the 2MB mark (plenty of space away from the code)
#define FLASH_TARGET_OFFSET (2 * 1024 * 1024)

// A "Secret" box that holds our info
struct SecretEntry {
    char service[32];   // e.g., "Instagram"
    char username[32];  // e.g., "user123"
    char password[64];  // We will encrypt this later!
};