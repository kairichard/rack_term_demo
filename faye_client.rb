$stdout.sync = true

require 'optparse'
require 'faye'
require 'eventmachine'
require 'optparse'
require 'optparse/time'
require 'ostruct'
require 'pp'
require 'shellwords'
require 'json'
require 'active_support/all'
load 'kash.rb'

class CommandDispatch
  def initialize(message)
    @return_object = {}

    message["command"] = "empty" if message["command"] == ""
    begin 
      args = message["command"].shellsplit 
    rescue ArgumentError => e 
      @return_object = { response:"-kash: "+e.to_s, exitcode: 127 }
      return 
    end

    command = args.first.downcase
    Sys.user_id = message['session_guid'] 
    begin
      raise Exception.new("comand not found") unless Sys.apps.available_apps.has_key?(command.to_sym)
      @return_object = { response: Sys.apps.available_apps[command.to_sym].execute(args[1..-1]), exitcode: 0 }
    rescue Exception => e 
      @return_object = { response:"-kash: #{command}: #{e.message}", exitcode: 127 }
    end

  end
  def return_object
    @return_object
  end
end

host = (ENV["FAYEHOST"] ? ENV["FAYEHOST"] : "http://kairichardkoenig.de") + '/socket'

EM.run {
  client = Faye::Client.new(host)
  client.subscribe('/command') do |message|
    client.publish('/backchannel/'+message["session_guid"],CommandDispatch.new(message).return_object)    
  end 
}



