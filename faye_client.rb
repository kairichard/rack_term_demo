require 'faye'
require 'eventmachine'
host = (ENV["FAYEHOST"] ? ENV["FAYEHOST"] : "http://kairichardkoenig.de") + '/socket'
puts host
EM.run {
  client = Faye::Client.new(host)

  client.subscribe('/command') do |message|
    client.publish('/backchannel/'+message["backchannel"],{response:message["text"]})
  end
  

}

