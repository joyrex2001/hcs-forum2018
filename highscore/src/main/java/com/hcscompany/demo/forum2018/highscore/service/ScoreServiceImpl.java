package com.hcscompany.demo.forum2018.highscore.service;

import java.util.List;
import java.util.UUID;
import java.util.Calendar;
import java.util.Optional;

import com.hcscompany.demo.forum2018.highscore.model.ScoreModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import com.hcscompany.demo.forum2018.highscore.model.ScoreModel;

@Service
public class ScoreServiceImpl implements ScoreService {

    @Autowired
    private ScoreModelRepository repository;

    @Override
    @Transactional
    public String put(ScoreModel model) {
        model.setId(UUID.randomUUID().toString());
        model.setCreationDate(Calendar.getInstance());
        model.setLastModificationDate(Calendar.getInstance());
        repository.save(model);
        return model.getId();
    }

    @Override
    public Optional<ScoreModel> get(String id) {
        return repository.findById(id);
    }

    @Override
    public void update(ScoreModel model) {
        repository.save(model);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    @Override
    public List<ScoreModel> listUserScores(String userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<ScoreModel> listTopScores(Integer amount) {
        return repository.findTopScores(PageRequest.of(0,amount) );
    }

}
