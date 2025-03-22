package com.fill_rouge.backend;

import com.fill_rouge.backend.config.BaseMongoTestContainer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Main application test that verifies the Spring context loads correctly.
 * To run all tests, use Maven: mvn test
 */
@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests extends BaseMongoTestContainer {

	@Test
	void contextLoads() {
		// Verifies the application context loads successfully
	}

}
