package com.hcscompany.demo.forum2018.highscore.model;

import java.io.Serializable;
import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Version;

import com.google.gson.annotations.Expose;

@Entity
@Table(name = "score",
    indexes = {
        @Index(name = "idx_playerId",
            columnList = "playerId"
        ),
        @Index(name = "idx_score",
            columnList = "score"
        ),
        @Index(name = "idx_time",
            columnList = "creationDate"
        )
    }
)

public class ScoreModel implements Serializable {
    @Id
    @Column(length=36)
    private String id;

    @Version
    private Integer version;

    @Temporal(TemporalType.TIMESTAMP)
    private Calendar lastModificationDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Calendar creationDate;

    @Column(length=36)
    private String playerId;

    @Expose
    @Column(length=16)
    private String name;

    @Expose
    @Column
    private Integer score;


    public String getId() {
        return id;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getName() {
        return name;
    }

    public Integer getScore() {
        return score;
    }

    public Calendar getCreationDate() {
        return creationDate;
    }

    public Calendar getLastModificationDate() {
        return lastModificationDate;
    }

    public Integer getVersion() {
        return version;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public void setCreationDate(Calendar creationDate) {
        this.creationDate = creationDate;
    }

    public void setLastModificationDate(Calendar lastModificationDate) {
        this.lastModificationDate = lastModificationDate;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }
}
