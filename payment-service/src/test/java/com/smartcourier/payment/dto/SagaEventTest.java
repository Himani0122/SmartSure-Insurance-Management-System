package com.smartcourier.payment.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SagaEventTest {
    @Test
    void testGetterSetter() {
        SagaEvent event = new SagaEvent();
        event.setSagaId(1L);
        event.setEventType("TEST");
        assertEquals(1L, event.getSagaId());
        assertEquals("TEST", event.getEventType());
        
        SagaEvent event2 = SagaEvent.builder().sagaId(2L).build();
        assertEquals(2L, event2.getSagaId());
    }
}
