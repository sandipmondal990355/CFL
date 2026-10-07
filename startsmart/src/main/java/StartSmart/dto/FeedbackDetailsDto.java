package StartSmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDetailsDto {
    private boolean submitted;
    private int rating;
    private String date;
    private String text;
    private List<String> tags;
}