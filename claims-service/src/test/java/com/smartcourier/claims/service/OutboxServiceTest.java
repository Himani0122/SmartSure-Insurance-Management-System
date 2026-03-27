package com.smartcourier.claims.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.claims.entity.OutboxEvent;
import com.smartcourier.claims.repository.OutboxRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OutboxServiceTest {

    @Mock
    private OutboxRepository outboxRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private OutboxService outboxService;

    @Test
    void saveEvent_Success() throws JsonProcessingException {
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        outboxService.saveEvent("Type", "1", "EVENT", Map.of("key", "val"));

        verify(outboxRepository, times(1)).save(any(OutboxEvent.class));
    }

    @Test
    void saveEvent_WhenSerializationFails_ShouldThrowException() throws JsonProcessingException {
        when(objectMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("Error") {});

        assertThrows(RuntimeException.class, () -> 
            outboxService.saveEvent("Type", "1", "EVENT", Map.of("key", "val"))
        );
    }
}
