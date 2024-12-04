package at.htlleonding.processor;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.concurrent.atomic.AtomicInteger;

@ApplicationScoped

public class CounterBean {


    @ConfigProperty(name = "json.file-directory-all")
    private String directoryNameAll;

    private final AtomicInteger counter = new AtomicInteger();

    public int get() {
        return counter.get();
    }


    @Scheduled(every="5s")
    void increment() {
      //  fileProcessorHelper.importJsonFiles(directoryNameAll,1);
        //LIMIT for the datas how many it should read at once

    }
}
