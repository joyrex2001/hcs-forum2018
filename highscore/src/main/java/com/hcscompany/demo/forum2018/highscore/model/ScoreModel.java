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

import org.hibernate.annotations.Type;

@Entity
@Table(name = "score",
    indexes = {
        @Index(name = "idx_userId",
            columnList = "userId"
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
    private String userId;

    @Column(length=16)
    private String name;

    @Column
    private Integer score;


    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
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

    public void setUserId(String userId) {
        this.userId = userId;
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
